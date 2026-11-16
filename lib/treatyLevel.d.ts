import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Player from '@civ-clone/core-player/Player';
/**
 * How far two players' treaties go, lowest first, so levels compare with `<` and `>=`.
 *
 * - `War`: a `War` is in force and no treaty is.
 * - `Contact`: no treaty and no war in force. Whether they have met at all is `haveMet`'s question, not this one's.
 * - `Ceasefire`, `Peace`, `Alliance`: the highest of those in force. An `Alliance` is a `Peace`, so any treaty it's
 *   in force with is counted as an alliance.
 *
 * Civ1's rules read only "at peace" (`>= TreatyLevel.Peace`), and they treat any two who have met with no peace as at
 *  war whether or not a `War` was declared (`atWar`), so for them `War` and `Contact` mean the same. `makePeace` leaves
 *  an earlier `War` in force, as it always has; `makeCeasefire` and `makeAlliance` end it, so a pair whose ceasefire
 *  lapses is left in contact, not at war, as in Civ2.
 */
export declare enum TreatyLevel {
  War = 0,
  Contact = 1,
  Ceasefire = 2,
  Peace = 3,
  Alliance = 4,
}
/**
 * The treaty level between `player` and `other` (`TreatyLevel`), from the declarations in force between them. Route
 *  finding asks about treaties for every step it considers (civ-clone/web-renderer#657), so this looks at the pair's
 *  interactions once and makes nothing.
 */
export declare const treatyLevel: (
  {
    interactionRegistry,
  }: {
    interactionRegistry: InteractionRegistry;
  },
  player: Player,
  other: Player
) => TreatyLevel;
/**
 * Whether the treaty level between `player` and `other` is `level` or higher: `treatyLevel(...) >= level`, but it
 *  stops looking as soon as it finds a treaty that high. `hasTreatyLevel(dependencies, a, b, TreatyLevel.Peace)` is
 *  "at peace", allies included.
 */
export declare const hasTreatyLevel: (
  {
    interactionRegistry,
  }: {
    interactionRegistry: InteractionRegistry;
  },
  player: Player,
  other: Player,
  level: TreatyLevel
) => boolean;
/**
 * A level's name, `'war'`, `'contact'`, `'ceasefire'`, `'peace'` or `'alliance'`, for wording and messages.
 */
export declare const treatyName: (level: TreatyLevel) => string;
export default treatyLevel;
