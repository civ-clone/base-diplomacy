import { IProposal } from '@civ-clone/core-diplomacy/Negotiation/Proposal';
import Dependencies from './Dependencies';
import InteractionRule from '@civ-clone/core-diplomacy/Rules/Negotiation/Interaction';
import { MeetingStep } from './meetingSteps';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';
export type ProposalMaker = (
  negotiation: Negotiation,
  person: Player,
  computer: Player
) => IProposal | null;
export interface PersonMeetingRules {
  isHuman: (player: Player) => boolean;
  proposals: ProposalMaker[];
  answer: (proposal: IProposal, negotiation: Negotiation) => boolean;
  patienceLimit: (negotiation: Negotiation) => number;
}
export declare const sides: (negotiation: Negotiation) => {
  person: Player;
  computer: Player;
};
export declare const personLed: (
  isHuman: (player: Player) => boolean,
  negotiation: Negotiation
) => boolean;
export declare const proposalAvailable: (
  { ruleRegistry }: Pick<Dependencies, 'ruleRegistry'>,
  proposal: IProposal
) => boolean;
/**
 * The opening: the person asks for an audience (`Initiate`), and the computer player receives them or not
 *  (`rules.answer`). Turned away, the computer player ends the meeting.
 */
export declare const audience: (
  dependencies: Dependencies,
  rules: Pick<PersonMeetingRules, 'isHuman' | 'answer'>
) => MeetingStep[];
/**
 * The menu: once the person is received, and again after each answer while the computer player's patience lasts,
 *  every proposal of `rules.proposals` the `ProposalAvailable` rules allow, one row each, in order, then leaving
 *  (`Terminate` by the person).
 */
export declare const proposalMenu: (
  dependencies: Dependencies,
  rules: Pick<PersonMeetingRules, 'isHuman' | 'proposals' | 'patienceLimit'>
) => MeetingStep[];
/**
 * The computer player's answer to each of the person's proposals, from `rules.answer`: the one step on offer, as an
 *  `Accept` or a `Decline` by the computer player.
 */
export declare const computerAnswer: (
  dependencies: Dependencies,
  rules: Pick<PersonMeetingRules, 'isHuman' | 'answer'>
) => MeetingStep[];
/**
 * Proposing again: after each answer the menu is offered again (`proposalMenu`) until the computer player's patience
 *  runs out, and then it ends the meeting.
 */
export declare const patienceEnds: (
  dependencies: Dependencies,
  rules: Pick<PersonMeetingRules, 'isHuman' | 'patienceLimit'>
) => MeetingStep[];
/**
 * Every piece, in order: the audience, the menu, the computer player's answers, and the end when its patience runs
 *  out.
 */
export declare const personMeetingSteps: (
  dependencies: Dependencies,
  rules: PersonMeetingRules
) => MeetingStep[];
/**
 * An `Interaction` rule that spends the computer player's patience with the person as each of the person's proposals is
 *  made (not the request for an audience): `cost(proposal, spent)` of it, 1 unless the ruleset says otherwise. A cost
 *  below 0 gives some back.
 */
export declare const spendPatienceRules: (
  prefix: string,
  dependencies: Dependencies,
  rules: Pick<PersonMeetingRules, 'isHuman'> & {
    cost?: ((proposal: IProposal, spent: number) => number) | undefined;
  }
) => InteractionRule[];
export default personMeetingSteps;
