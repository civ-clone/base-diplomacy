"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareMaps = void 0;
/**
 * `player` and `other` share their maps: each comes to know every square the other knows (`PlayerWorld#register`,
 *  which tells the `VisibilityChanged` rules of each new one). A known square shows what is on it now, improvements
 *  and cities included, so nothing else needs copying. Both maps are read before either changes, so neither gets back
 *  what it has just given. Answers how many squares each learned, `[player's, other's]`.
 */
const shareMaps = ({ playerWorldRegistry, }, player, other) => {
    const world = playerWorldRegistry.getByPlayer(player), otherWorld = playerWorldRegistry.getByPlayer(other), tilesOf = (playerTiles) => playerTiles.map((playerTile) => playerTile.tile()), known = tilesOf(world.tiles()), otherKnown = tilesOf(otherWorld.tiles()), learned = otherKnown.filter((tile) => !world.includes(tile)), otherLearned = known.filter((tile) => !otherWorld.includes(tile));
    world.register(...learned);
    otherWorld.register(...otherLearned);
    return [learned.length, otherLearned.length];
};
exports.shareMaps = shareMaps;
exports.default = exports.shareMaps;
//# sourceMappingURL=shareMaps.js.map