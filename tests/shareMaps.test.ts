import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import VisibilityChanged from '@civ-clone/core-player-world/Rules/Player/VisibilityChanged';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import shareMaps from '../lib/shareMaps';

describe('shareMaps', (): void => {
  it('gives each player every square the other knows, once, both ways', (): void => {
    const ruleRegistry = new RuleRegistry(),
      world = { width: () => 4, height: () => 4 } as unknown as World,
      tiles = Array.from({ length: 6 }, (_, i) =>
        Object.assign(Object.create(Tile.prototype), {
          x: () => i % 4,
          y: () => Math.floor(i / 4),
        })
      ),
      [a, b, c] = [0, 1, 2].map(() => new Player(ruleRegistry)),
      playerWorldRegistry = new PlayerWorldRegistry(),
      [worldA, worldB, worldC] = [a, b, c].map(
        (player) => new PlayerWorld(player, world, ruleRegistry)
      ),
      seen: [Tile, Player][] = [];

    playerWorldRegistry.register(worldA, worldB, worldC);

    worldA.register(tiles[0], tiles[1], tiles[2]);
    worldB.register(tiles[2], tiles[3]);
    worldC.register(tiles[5]);

    ruleRegistry.register(
      new VisibilityChanged(
        new Effect((tile: Tile, player: Player): void => {
          seen.push([tile, player]);
        })
      )
    );

    expect(shareMaps({ playerWorldRegistry }, a, b)).to.deep.equal([1, 2]);

    const known = (playerWorld: PlayerWorld): Tile[] =>
      playerWorld.tiles().map((playerTile) => playerTile.tile());

    expect(known(worldA)).to.have.members([
      tiles[0],
      tiles[1],
      tiles[2],
      tiles[3],
    ]);
    expect(known(worldB)).to.have.members([
      tiles[0],
      tiles[1],
      tiles[2],
      tiles[3],
    ]);
    // A third player learns nothing.
    expect(known(worldC)).to.deep.equal([tiles[5]]);
    expect(seen).to.deep.equal([
      [tiles[3], a],
      [tiles[0], b],
      [tiles[1], b],
    ]);

    // Shared again, there is nothing new.
    expect(shareMaps({ playerWorldRegistry }, b, a)).to.deep.equal([0, 0]);
  });
});
