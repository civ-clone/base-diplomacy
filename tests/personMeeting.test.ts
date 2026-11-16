import {
  PersonMeetingRules,
  personMeetingSteps,
  spendPatienceRules,
} from '../lib/personMeeting';
import Accept from '@civ-clone/core-diplomacy/Proposal/Accept';
import Criterion from '@civ-clone/core-rule/Criterion';
import Decline from '@civ-clone/core-diplomacy/Proposal/Decline';
import DemandTribute from '@civ-clone/library-diplomacy/Proposals/DemandTribute';
import Effect from '@civ-clone/core-rule/Effect';
import ExchangeKnowledge from '@civ-clone/library-diplomacy/Proposals/ExchangeKnowledge';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import { IAction } from '@civ-clone/core-diplomacy/Negotiation/Action';
import { IProposal } from '@civ-clone/core-diplomacy/Negotiation/Proposal';
import Initiate from '@civ-clone/core-diplomacy/Negotiation/Initiate';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import OfferPeace from '@civ-clone/library-diplomacy/Proposals/OfferPeace';
import ProposalAvailable from '../Rules/ProposalAvailable';
import Resolution from '@civ-clone/core-diplomacy/Proposal/Resolution';
import Step from '@civ-clone/core-diplomacy/Rules/Negotiation/Step';
import Terminate from '@civ-clone/core-diplomacy/Negotiation/Terminate';
import { expect } from 'chai';
import patience from '../lib/patience';
import { MeetingStepNumbers, meetingSteps } from '../lib/meetingSteps';
import position from './lib/position';

const setUp = (
  answer: (proposal: IProposal) => boolean = (proposal) =>
    proposal instanceof Initiate || proposal instanceof OfferPeace,
  limit = 2
) => {
  const setUp = position([{ human: true }, {}]),
    { dependencies, readers, ruleRegistry } = setUp,
    rules: PersonMeetingRules = {
      isHuman: readers.isHuman,
      proposals: [
        (negotiation, person) =>
          new OfferPeace(person, negotiation, ruleRegistry),
        (negotiation, person) =>
          new DemandTribute(new Gold(50), person, negotiation, ruleRegistry),
        (negotiation, person) =>
          new ExchangeKnowledge([], person, negotiation, ruleRegistry),
        // Nothing of this kind to propose just now.
        () => null,
      ],
      answer,
      patienceLimit: () => limit,
    };

  ruleRegistry.register(
    ...personMeetingSteps(dependencies, rules).map(
      ([applies, next]) =>
        new Step(
          new Criterion(
            (negotiation: Negotiation): boolean =>
              applies(negotiation) && next(negotiation) !== null
          ),
          new Effect((negotiation: Negotiation): IAction => next(negotiation)!)
        )
    ),
    ...spendPatienceRules('test', dependencies, { isHuman: readers.isHuman }),
    // Peace may be offered; tribute may not; nothing speaks for an exchange, so it isn't offered either.
    new ProposalAvailable(
      new Criterion((proposal: IProposal) => proposal instanceof OfferPeace),
      new Effect(() => true)
    ),
    new ProposalAvailable(
      new Criterion((proposal: IProposal) => proposal instanceof DemandTribute),
      new Effect(() => true)
    ),
    new ProposalAvailable(
      new Criterion((proposal: IProposal) => proposal instanceof DemandTribute),
      new Effect(() => false)
    )
  );

  return setUp;
};

// Takes the step `pick` chooses from those on offer, resolving a resolution's proposal, as the drivers do.
const take = async (
  negotiation: Negotiation,
  pick: (steps: IAction[]) => IAction = (steps) => steps[0]
): Promise<IAction> => {
  const step = pick(negotiation.nextSteps());

  negotiation.proceed(step);

  if (step instanceof Resolution) {
    await step.proposal().resolve(step);
  }

  return step;
};

const kinds = (steps: IAction[]): string[] =>
  steps.map((step) => `${step.constructor.name}:${step.by().id()}`);

describe('personMeetingSteps', (): void => {
  it('opens with the audience, offers the menu, answers, and ends when patience runs out', async (): Promise<void> => {
    const { dependencies, players, ruleRegistry } = setUp(),
      [person, computer] = players,
      negotiation = new Negotiation(person, computer, ruleRegistry),
      menu = [`OfferPeace:${person.id()}`, `Terminate:${person.id()}`];

    expect(kinds(negotiation.nextSteps())).to.deep.equal([
      `Initiate:${person.id()}`,
    ]);

    await take(negotiation);

    // The computer player receives the person: its answer is the one step.
    expect(kinds(negotiation.nextSteps())).to.deep.equal([
      `Accept:${computer.id()}`,
    ]);

    await take(negotiation);

    expect(kinds(negotiation.nextSteps())).to.deep.equal(menu);
    // The request for an audience costs no patience.
    expect(patience(dependencies, computer, person).spent()).equal(0);

    await take(negotiation);

    expect(patience(dependencies, computer, person).spent()).equal(1);
    expect(kinds(negotiation.nextSteps())).to.deep.equal([
      `Accept:${computer.id()}`,
    ]);

    await take(negotiation);

    // Patience left: propose again.
    expect(kinds(negotiation.nextSteps())).to.deep.equal(menu);

    await take(negotiation);
    await take(negotiation);

    expect(patience(dependencies, computer, person).spent()).equal(2);
    // None left: the computer player ends the meeting.
    expect(kinds(negotiation.nextSteps())).to.deep.equal([
      `Terminate:${computer.id()}`,
    ]);

    await take(negotiation);

    expect(negotiation.terminated()).true;
  });

  it('declines with the answer function, and the person may leave', async (): Promise<void> => {
    const { players, ruleRegistry } = setUp(
        (proposal) => proposal instanceof Initiate
      ),
      [person, computer] = players,
      negotiation = new Negotiation(person, computer, ruleRegistry);

    await take(negotiation);
    await take(negotiation);
    await take(negotiation);

    const [answer] = negotiation.nextSteps();

    expect(answer).instanceof(Decline);
    expect(answer.by()).equal(computer);

    await take(negotiation);
    await take(negotiation, (steps) => steps[steps.length - 1]);

    expect(negotiation.lastInteraction()).instanceof(Terminate);
    expect(negotiation.lastInteraction()!.by()).equal(person);
    expect(negotiation.terminated()).true;
  });

  it('is ended by the computer player when it turns the person away', async (): Promise<void> => {
    const { players, ruleRegistry } = setUp(() => false),
      [person, computer] = players,
      negotiation = new Negotiation(person, computer, ruleRegistry);

    await take(negotiation);

    const [refusal] = negotiation.nextSteps();

    expect(refusal).instanceof(Decline);

    await take(negotiation);

    expect(kinds(negotiation.nextSteps())).to.deep.equal([
      `Terminate:${computer.id()}`,
    ]);
  });

  it('starts from the patience already spent, and offers nothing more once it has run out', async (): Promise<void> => {
    const { dependencies, players, ruleRegistry } = setUp(undefined, 1),
      [person, computer] = players,
      negotiation = new Negotiation(person, computer, ruleRegistry);

    patience(dependencies, computer, person).spend(5);

    await take(negotiation);
    await take(negotiation);
    // Received, the person may still make one proposal.
    expect(negotiation.lastInteraction()).instanceof(Accept);

    await take(negotiation);
    await take(negotiation);

    expect(kinds(negotiation.nextSteps())).to.deep.equal([
      `Terminate:${computer.id()}`,
    ]);
  });

  it('has nothing to say in a meeting a computer player opened', (): void => {
    const { players, ruleRegistry } = setUp(),
      [person, computer] = players,
      negotiation = new Negotiation(computer, person, ruleRegistry);

    // Only the negotiation's own fallback: the opener ends it.
    expect(kinds(negotiation.nextSteps())).to.deep.equal([
      `Terminate:${computer.id()}`,
    ]);
  });
});

describe('personMeetingSteps beside meetingSteps', (): void => {
  const numbers: MeetingStepNumbers = {
    openKnowledge: 6,
    provokingTribute: 100,
    goldUnit: 50,
    advanceGiftFear: 3,
    goldGift: (fear: number): number => fear,
  };

  // Both sets of rows registered, as a rule set with both kinds of meeting registers them, `meetingSteps` told who is
  //  a person.
  const both = () => {
    const built = setUp(),
      { dependencies, readers, ruleRegistry } = built;

    ruleRegistry.register(
      ...meetingSteps(
        dependencies,
        {
          isHuman: readers.isHuman,
          meeting: (): never => {
            throw new Error('Not asked for in these steps.');
          },
          hasSenate: (): boolean => false,
          advanceTaken: (): never => {
            throw new Error('Not asked for in these steps.');
          },
          takenBy: () => null,
        },
        numbers
      ).map(
        ([applies, next]) =>
          new Step(
            new Criterion(
              (negotiation: Negotiation): boolean =>
                applies(negotiation) && next(negotiation) !== null
            ),
            new Effect(
              (negotiation: Negotiation): IAction => next(negotiation)!
            )
          )
      )
    );

    return built;
  };

  it('leaves a meeting a person opened to the person-led rows', async (): Promise<void> => {
    const { players, ruleRegistry } = both(),
      [person, computer] = players,
      negotiation = new Negotiation(person, computer, ruleRegistry);

    // One Initiate, not one from each set of rows.
    expect(kinds(negotiation.nextSteps())).to.deep.equal([
      `Initiate:${person.id()}`,
    ]);

    await take(negotiation);

    // Only the computer player's own answer, not `meetingSteps`' Accept and Decline as well.
    expect(kinds(negotiation.nextSteps())).to.deep.equal([
      `Accept:${computer.id()}`,
    ]);

    await take(negotiation);

    expect(kinds(negotiation.nextSteps())).to.deep.equal([
      `OfferPeace:${person.id()}`,
      `Terminate:${person.id()}`,
    ]);
  });

  it('leaves a meeting a computer player opened to meetingSteps', (): void => {
    const { players, ruleRegistry } = both(),
      [person, computer] = players,
      negotiation = new Negotiation(computer, person, ruleRegistry);

    expect(kinds(negotiation.nextSteps())).to.deep.equal([
      `Initiate:${computer.id()}`,
    ]);

    negotiation.proceed(negotiation.nextSteps()[0]);

    expect(kinds(negotiation.nextSteps())).to.deep.equal([
      `Accept:${person.id()}`,
      `Decline:${person.id()}`,
    ]);
  });
});
