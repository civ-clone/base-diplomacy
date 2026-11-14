import Criterion from '@civ-clone/core-rule/Criterion';
import Dependencies from '../Dependencies';
import Effect from '@civ-clone/core-rule/Effect';
import MayNegotiate from '@civ-clone/library-diplomacy/Rules/Player/MayNegotiate';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Player from '@civ-clone/core-player/Player';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import { lastNegotiated } from '@civ-clone/library-diplomacy/lib/mayNegotiate';

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
export const mayNegotiateRules = (
  prefix: string,
  dependencies: Dependencies,
  isHuman: (player: Player) => boolean,
  spacing: MeetingSpacing
): MayNegotiate[] => {
  const humanInvolved = (player: Player, other: Player): boolean =>
    isHuman(player) || isHuman(other);

  return [
    new MayNegotiate(
      `${prefix}:player/may-negotiate/not-the-barbarians`,
      new Criterion(
        (player: Player, other: Player): boolean =>
          isBarbarian(player) || isBarbarian(other)
      ),
      new Effect((): boolean => false)
    ),
    new MayNegotiate(
      `${prefix}:player/may-negotiate/with-the-human`,
      new Criterion(humanInvolved),
      new Effect((player: Player, other: Player): boolean => {
        const last = lastNegotiated(
          player,
          other,
          dependencies.interactionRegistry
        );

        if (last === null) {
          return true;
        }

        const treatySince = dependencies.interactionRegistry
          .getByPlayers(player, other)
          .some(
            (interaction) =>
              interaction instanceof Peace && interaction.when() >= last
          );

        return (
          dependencies.turn.value() - last >=
          (treatySince ? spacing.withPersonAfterTreaty : spacing.withPerson)
        );
      })
    ),
    new MayNegotiate(
      `${prefix}:player/may-negotiate/computer-players`,
      new Criterion(
        (player: Player, other: Player): boolean =>
          !humanInvolved(player, other)
      ),
      new Effect((player: Player, other: Player): boolean => {
        const last = lastNegotiated(
          player,
          other,
          dependencies.interactionRegistry
        );

        return (
          last === null || dependencies.turn.value() - last >= spacing.computers
        );
      })
    ),
  ];
};

export default mayNegotiateRules;
