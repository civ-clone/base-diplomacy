import Alliance from '@civ-clone/base-diplomacy-declaration-alliance/Alliance';
import Ceasefire from '@civ-clone/base-diplomacy-declaration-ceasefire/Ceasefire';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Player from '@civ-clone/core-player/Player';
import War from '@civ-clone/base-diplomacy-declaration-war/War';

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
export enum TreatyLevel {
  War = 0,
  Contact = 1,
  Ceasefire = 2,
  Peace = 3,
  Alliance = 4,
}

// The highest level in force among `interactions`, looking no further once a treaty of at least `enough` is found.
const levelOf = (
  interactions: readonly unknown[],
  enough: TreatyLevel
): TreatyLevel => {
  let level = TreatyLevel.Contact;

  for (let i = 0; i < interactions.length; i++) {
    const interaction = interactions[i];

    if (interaction instanceof Alliance) {
      if (interaction.active()) {
        return TreatyLevel.Alliance;
      }
    } else if (interaction instanceof Peace) {
      if (level < TreatyLevel.Peace && interaction.active()) {
        level = TreatyLevel.Peace;
      }
    } else if (interaction instanceof Ceasefire) {
      if (level < TreatyLevel.Ceasefire && interaction.active()) {
        level = TreatyLevel.Ceasefire;
      }
    } else if (interaction instanceof War) {
      if (level === TreatyLevel.Contact && interaction.active()) {
        level = TreatyLevel.War;
      }
    }

    // A treaty in force can't be lowered by anything later in the list, but `Contact` can still turn out to be `War`.
    if (level >= enough && level >= TreatyLevel.Ceasefire) {
      return level;
    }
  }

  return level;
};

/**
 * The treaty level between `player` and `other` (`TreatyLevel`), from the declarations in force between them. Route
 *  finding asks about treaties for every step it considers (civ-clone/web-renderer#657), so this looks at the pair's
 *  interactions once and makes nothing.
 */
export const treatyLevel = (
  { interactionRegistry }: { interactionRegistry: InteractionRegistry },
  player: Player,
  other: Player
): TreatyLevel =>
  levelOf(
    interactionRegistry.getByPlayers(player, other),
    TreatyLevel.Alliance
  );

/**
 * Whether the treaty level between `player` and `other` is `level` or higher: `treatyLevel(...) >= level`, but it
 *  stops looking as soon as it finds a treaty that high. `hasTreatyLevel(dependencies, a, b, TreatyLevel.Peace)` is
 *  "at peace", allies included.
 */
export const hasTreatyLevel = (
  { interactionRegistry }: { interactionRegistry: InteractionRegistry },
  player: Player,
  other: Player,
  level: TreatyLevel
): boolean =>
  levelOf(interactionRegistry.getByPlayers(player, other), level) >= level;

/**
 * A level's name, `'war'`, `'contact'`, `'ceasefire'`, `'peace'` or `'alliance'`, for wording and messages.
 */
export const treatyName = (level: TreatyLevel): string =>
  TreatyLevel[level].toLowerCase();

export default treatyLevel;
