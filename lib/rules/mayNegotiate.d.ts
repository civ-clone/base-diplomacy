import Dependencies from '../Dependencies';
import MayNegotiate from '@civ-clone/library-diplomacy/Rules/Player/MayNegotiate';
import Player from '@civ-clone/core-player/Player';
/** How many turns apart players meet. */
export interface MeetingSpacing {
  /** A computer player and a person, after they last met. */
  withPerson: number;
  /** A computer player and a person, after they last met if a treaty was signed since. */
  withPersonAfterTreaty: number;
  /** Two computer players, after they last met. */
  computers: number;
}
/**
 * When two players may meet:
 *
 * - `<prefix>:player/may-negotiate/not-the-barbarians`: never with the barbarians (a rule that answers no, rather than
 *   a criterion on the others: with no rule applying, `mayNegotiate` says yes);
 * - `<prefix>:player/may-negotiate/with-the-human`: a computer player and a person, `spacing.withPerson` turns after
 *   they last met, or `spacing.withPersonAfterTreaty` after a treaty was signed since;
 * - `<prefix>:player/may-negotiate/computer-players`: two computer players at first contact, then `spacing.computers`
 *   turns after they last met.
 */
export declare const mayNegotiateRules: (
  prefix: string,
  dependencies: Dependencies,
  isHuman: (player: Player) => boolean,
  spacing: MeetingSpacing
) => MayNegotiate[];
export default mayNegotiateRules;
