import Proposal, {
  IProposal,
} from '@civ-clone/core-diplomacy/Negotiation/Proposal';
import Accept from '@civ-clone/core-diplomacy/Proposal/Accept';
import Decline from '@civ-clone/core-diplomacy/Proposal/Decline';
import Dependencies from './Dependencies';
import { IAction } from '@civ-clone/core-diplomacy/Negotiation/Action';
import { IInteraction } from '@civ-clone/core-diplomacy/Interaction';
import Initiate from '@civ-clone/core-diplomacy/Negotiation/Initiate';
import InteractionRule from '@civ-clone/core-diplomacy/Rules/Negotiation/Interaction';
import { MeetingStep } from './meetingSteps';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';
import ProposalAvailable from '../Rules/ProposalAvailable';
import Resolution from '@civ-clone/core-diplomacy/Proposal/Resolution';
import Terminate from '@civ-clone/core-diplomacy/Negotiation/Terminate';
import patience from './patience';

// Pieces for a meeting a person leads: the person opens it (`Negotiation#initiator()`), picks what to propose from a
//  menu, and the computer player answers each proposal, for as long as its patience lasts. Each piece is a list of
//  `MeetingStep`s, `[criterion, next]` like `meetingSteps`' rows, for the ruleset to make `Step` rules of
//  (`stepRules` does it for `meetingSteps`), and every one of them applies only when a person opened the negotiation:
//  a meeting a computer player opens (Civ1's, from `meetingSteps`) is untouched. `meetingFor` works a meeting out from
//  the first player's side, the computer's in Civ1, so a ruleset doesn't ask it for these.
//
// What is said is the ruleset's: the proposals it offers, how the computer player answers, how much patience it has and
//  what each proposal costs. Patience is kept between meetings (`patience`), spent by `spendPatienceRules`.

// Makes one proposal the person might make, or `null` when it has nothing to propose of that kind just now.
export type ProposalMaker = (
  negotiation: Negotiation,
  person: Player,
  computer: Player
) => IProposal | null;

export interface PersonMeetingRules {
  // Whether a person plays `player` rather than the computer.
  isHuman: (player: Player) => boolean;
  // What the person may propose, in the order the menu lists them. Each is offered only while the `ProposalAvailable`
  //  rules allow it.
  proposals: ProposalMaker[];
  // The computer player's answer to `proposal`, the person's request for an audience (`Initiate`) included: `true`
  //  accepts, `false` declines.
  answer: (proposal: IProposal, negotiation: Negotiation) => boolean;
  // How much of its patience with the person the computer player may have spent and still listen to another proposal.
  patienceLimit: (negotiation: Negotiation) => number;
}

// The two sides of a negotiation a person opened: the person, and the computer player they came to.
export const sides = (
  negotiation: Negotiation
): { person: Player; computer: Player } => {
  const person = negotiation.initiator();

  return {
    person,
    computer: negotiation.players().find((player) => player !== person)!,
  };
};

// Whether a person opened `negotiation` to talk to a computer player.
export const personLed = (
  isHuman: (player: Player) => boolean,
  negotiation: Negotiation
): boolean => {
  const { person, computer } = sides(negotiation);

  return isHuman(person) && computer !== undefined && !isHuman(computer);
};

// Whether `proposal` may be offered: at least one `ProposalAvailable` rule answers, and every answer is `true`.
export const proposalAvailable = (
  { ruleRegistry }: Pick<Dependencies, 'ruleRegistry'>,
  proposal: IProposal
): boolean => {
  const answers = ruleRegistry.process(ProposalAvailable, proposal);

  return answers.length > 0 && answers.every((answer) => answer);
};

const last = (negotiation: Negotiation): IAction | null =>
  negotiation.lastInteraction();

// The computer player's answer to the person's proposal, made last: what the menu offers again after.
const answeredByComputer = (negotiation: Negotiation): boolean => {
  const action = last(negotiation),
    { person, computer } = sides(negotiation);

  return (
    action instanceof Resolution &&
    action.by() === computer &&
    action.proposal().by() === person &&
    !(action.proposal() instanceof Initiate)
  );
};

// Whether the computer player still has the patience to hear another proposal.
const patient = (
  dependencies: Dependencies,
  rules: Pick<PersonMeetingRules, 'patienceLimit'>,
  negotiation: Negotiation
): boolean => {
  const { person, computer } = sides(negotiation);

  return (
    patience(dependencies, computer, person).spent() <
    rules.patienceLimit(negotiation)
  );
};

/**
 * The opening: the person asks for an audience (`Initiate`), and the computer player receives them or not
 *  (`rules.answer`). Turned away, the computer player ends the meeting.
 */
export const audience = (
  dependencies: Dependencies,
  rules: Pick<PersonMeetingRules, 'isHuman' | 'answer'>
): MeetingStep[] => {
  const { ruleRegistry } = dependencies,
    led = (negotiation: Negotiation): boolean =>
      personLed(rules.isHuman, negotiation);

  return [
    [
      (negotiation) => led(negotiation) && last(negotiation) === null,
      (negotiation) =>
        new Initiate(negotiation.initiator(), negotiation, ruleRegistry),
    ],
    [
      (negotiation) =>
        led(negotiation) &&
        last(negotiation) instanceof Initiate &&
        last(negotiation)!.by() === negotiation.initiator(),
      (negotiation) => {
        const initiate = last(negotiation) as unknown as Proposal,
          { computer } = sides(negotiation);

        return rules.answer(initiate, negotiation)
          ? new Accept(computer, initiate, ruleRegistry)
          : new Decline(computer, initiate, ruleRegistry);
      },
    ],
    [
      (negotiation) => {
        const action = last(negotiation);

        return (
          led(negotiation) &&
          action instanceof Decline &&
          action.proposal() instanceof Initiate
        );
      },
      (negotiation) =>
        new Terminate(sides(negotiation).computer, negotiation, ruleRegistry),
    ],
  ];
};

/**
 * The menu: once the person is received, and again after each answer while the computer player's patience lasts,
 *  every proposal of `rules.proposals` the `ProposalAvailable` rules allow, one row each, in order, then leaving
 *  (`Terminate` by the person).
 */
export const proposalMenu = (
  dependencies: Dependencies,
  rules: Pick<PersonMeetingRules, 'isHuman' | 'proposals' | 'patienceLimit'>
): MeetingStep[] => {
  const { ruleRegistry } = dependencies,
    open = (negotiation: Negotiation): boolean => {
      if (!personLed(rules.isHuman, negotiation)) {
        return false;
      }

      const action = last(negotiation);

      if (action instanceof Accept && action.proposal() instanceof Initiate) {
        return true;
      }

      return (
        answeredByComputer(negotiation) &&
        patient(dependencies, rules, negotiation)
      );
    };

  return [
    ...rules.proposals.map(
      (make: ProposalMaker): MeetingStep => [
        open,
        (negotiation) => {
          const { person, computer } = sides(negotiation),
            proposal = make(negotiation, person, computer);

          return proposal !== null && proposalAvailable(dependencies, proposal)
            ? proposal
            : null;
        },
      ]
    ),
    [
      open,
      (negotiation) =>
        new Terminate(negotiation.initiator(), negotiation, ruleRegistry),
    ],
  ];
};

/**
 * The computer player's answer to each of the person's proposals, from `rules.answer`: the one step on offer, as an
 *  `Accept` or a `Decline` by the computer player.
 */
export const computerAnswer = (
  dependencies: Dependencies,
  rules: Pick<PersonMeetingRules, 'isHuman' | 'answer'>
): MeetingStep[] => {
  const { ruleRegistry } = dependencies;

  return [
    [
      (negotiation) => {
        const action = last(negotiation);

        return (
          personLed(rules.isHuman, negotiation) &&
          action instanceof Proposal &&
          !(action instanceof Initiate) &&
          action.by() === negotiation.initiator() &&
          !action.resolved()
        );
      },
      (negotiation) => {
        const proposal = last(negotiation) as unknown as Proposal,
          { computer } = sides(negotiation);

        return rules.answer(proposal, negotiation)
          ? new Accept(computer, proposal, ruleRegistry)
          : new Decline(computer, proposal, ruleRegistry);
      },
    ],
  ];
};

/**
 * Proposing again: after each answer the menu is offered again (`proposalMenu`) until the computer player's patience
 *  runs out, and then it ends the meeting.
 */
export const patienceEnds = (
  dependencies: Dependencies,
  rules: Pick<PersonMeetingRules, 'isHuman' | 'patienceLimit'>
): MeetingStep[] => [
  [
    (negotiation) =>
      personLed(rules.isHuman, negotiation) &&
      answeredByComputer(negotiation) &&
      !patient(dependencies, rules, negotiation),
    (negotiation) =>
      new Terminate(
        sides(negotiation).computer,
        negotiation,
        dependencies.ruleRegistry
      ),
  ],
];

/**
 * Every piece, in order: the audience, the menu, the computer player's answers, and the end when its patience runs
 *  out.
 */
export const personMeetingSteps = (
  dependencies: Dependencies,
  rules: PersonMeetingRules
): MeetingStep[] => [
  ...audience(dependencies, rules),
  ...proposalMenu(dependencies, rules),
  ...computerAnswer(dependencies, rules),
  ...patienceEnds(dependencies, rules),
];

/**
 * An `Interaction` rule that spends the computer player's patience with the person as each of the person's proposals is
 *  made (not the request for an audience): `cost(proposal, spent)` of it, 1 unless the ruleset says otherwise. A cost
 *  below 0 gives some back.
 */
export const spendPatienceRules = (
  prefix: string,
  dependencies: Dependencies,
  rules: Pick<PersonMeetingRules, 'isHuman'> & {
    cost?: (proposal: IProposal, spent: number) => number;
  }
): InteractionRule[] => [
  new InteractionRule(
    `${prefix}:negotiation/interaction/spend-patience`,
    new Criterion(
      (interaction: IInteraction, negotiation: Negotiation): boolean =>
        personLed(rules.isHuman, negotiation) &&
        interaction instanceof Proposal &&
        !(interaction instanceof Initiate) &&
        interaction.by() === negotiation.initiator()
    ),
    new Effect((interaction: IInteraction, negotiation: Negotiation): void => {
      const { person, computer } = sides(negotiation),
        computerPatience = patience(dependencies, computer, person),
        cost = rules.cost ?? ((): number => 1);

      computerPatience.spend(
        cost(interaction as unknown as IProposal, computerPatience.spent())
      );
    })
  ),
];

export default personMeetingSteps;
