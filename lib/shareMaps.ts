import Player from '@civ-clone/core-player/Player';
import PlayerTile from '@civ-clone/core-player-world/PlayerTile';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import Tile from '@civ-clone/core-world/Tile';

/**
 * `player` and `other` share their maps: each comes to know every square the other knows (`PlayerWorld#register`,
 *  which tells the `VisibilityChanged` rules of each new one). A known square shows what is on it now, improvements
 *  and cities included, so nothing else needs copying. Both maps are read before either changes, so neither gets back
 *  what it has just given. Answers how many squares each learned, `[player's, other's]`.
 */
export const shareMaps = (
  {
    playerWorldRegistry,
  }: {
    playerWorldRegistry: PlayerWorldRegistry;
  },
  player: Player,
  other: Player
): [number, number] => {
  const world = playerWorldRegistry.getByPlayer(player),
    otherWorld = playerWorldRegistry.getByPlayer(other),
    tilesOf = (playerTiles: PlayerTile[]): Tile[] =>
      playerTiles.map((playerTile: PlayerTile): Tile => playerTile.tile()),
    known = tilesOf(world.tiles()),
    otherKnown = tilesOf(otherWorld.tiles()),
    learned = otherKnown.filter((tile: Tile): boolean => !world.includes(tile)),
    otherLearned = known.filter(
      (tile: Tile): boolean => !otherWorld.includes(tile)
    );

  world.register(...learned);
  otherWorld.register(...otherLearned);

  return [learned.length, otherLearned.length];
};

export default shareMaps;
