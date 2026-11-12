import { Meeting } from './meeting';
import Advance from '@civ-clone/core-science/Advance';
import Dependencies from './Dependencies';
import { IAction } from '@civ-clone/core-diplomacy/Negotiation/Action';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';
export type Next = (negotiation: Negotiation) => IAction | null;
export type MeetingStep = [(negotiation: Negotiation) => boolean, Next];
export interface MeetingStepRules {
  meeting: (negotiation: Negotiation) => Meeting;
  hasSenate: (player: Player) => boolean;
  advanceTaken: (
    player: Player,
    advance: typeof Advance,
    negotiation: Negotiation
  ) => IAction;
  takenBy: (proposal: any, player: Player) => typeof Advance | null;
}
export interface MeetingStepNumbers {
  openKnowledge: number;
  provokingTribute: number;
  goldUnit: number;
  advanceGiftFear: number;
  goldGift: (fear: number) => number;
}
export declare const meetingSteps: (
  dependencies: Dependencies,
  rules: MeetingStepRules,
  numbers: MeetingStepNumbers
) => MeetingStep[];
export default meetingSteps;
