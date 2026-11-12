import { IProposal } from '@civ-clone/core-diplomacy/Negotiation/Proposal';
import Dependencies from './Dependencies';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';
import { Stance } from './stance';
export interface Meeting {
  player: Player;
  other: Player;
  computer: 'war' | 'peace' | 'nothing' | null;
  stance: Stance;
  firstContact: boolean;
}
export interface MeetingRules {
  isHuman: (player: Player) => boolean;
  hasSenate: (player: Player) => boolean;
  wouldGoToWar: (player: Player, other: Player) => boolean;
  stance: (
    player: Player,
    other: Player,
    random: () => number,
    changeGovernment: (player: Player) => void
  ) => Stance;
  changeGovernment: (player: Player) => void;
}
export declare const meetingFor: (
  dependencies: Dependencies,
  rules: MeetingRules,
  negotiation: Negotiation,
  random: () => number
) => Meeting;
export declare const knownMeeting: (negotiation: Negotiation) => Meeting | null;
export declare const negotiationOf: (proposal: IProposal) => Negotiation;
export declare const calm: (proposal: IProposal) => void;
export default meetingFor;
