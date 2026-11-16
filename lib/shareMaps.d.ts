import Player from '@civ-clone/core-player/Player';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
/**
 * `player` and `other` share their maps: each comes to know every square the other knows (`PlayerWorld#register`,
 *  which tells the `VisibilityChanged` rules of each new one). A known square shows what is on it now, improvements
 *  and cities included, so nothing else needs copying. Both maps are read before either changes, so neither gets back
 *  what it has just given. Answers how many squares each learned, `[player's, other's]`.
 */
export declare const shareMaps: (
  {
    playerWorldRegistry,
  }: {
    playerWorldRegistry: PlayerWorldRegistry;
  },
  player: Player,
  other: Player
) => [number, number];
export default shareMaps;
