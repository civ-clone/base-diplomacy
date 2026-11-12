import Advance from '@civ-clone/core-science/Advance';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import Criterion from '@civ-clone/core-rule/Criterion';
import Dependencies from '../../lib/Dependencies';
import Effect from '@civ-clone/core-rule/Effect';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import LandMass from '@civ-clone/core-world/LandMass';
import MilitaryStrength from '@civ-clone/core-power/Rules/MilitaryStrength';
import Pacified from '@civ-clone/library-diplomacy/Rules/Player/Pacified';
import Player from '@civ-clone/core-player/Player';
import Rank from '@civ-clone/core-power/Rules/Rank';
import Readers from '../../lib/Readers';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

// A hand-built position: who has what where, with stand-ins for everything the arithmetic only reads. Land masses
//  are lists of stand-in tiles; a unit or city is on one of them, or at sea.
export interface Side {
  human?: boolean;
  gold?: number;
  rank?: number;
  mood?: number;
  senate?: boolean;
  advances?: (typeof Advance)[];
  units?: {
    on: number | null;
    attack: number;
    defence: number;
    nuclear?: boolean;
  }[];
  cities?: number[];
}

export class Bronze extends Advance {}
export class Wheel extends Advance {}
export class Alphabet extends Advance {}

export const position = (
  sides: Side[],
  {
    landMasses = 3,
    level = 3,
    turn = 100,
    pacified = [],
  }: {
    landMasses?: number;
    level?: number;
    turn?: number;
    pacified?: [number, number][];
  } = {}
) => {
  const ruleRegistry = new RuleRegistry(),
    interactionRegistry = new InteractionRegistry(),
    tiles = Array.from({ length: landMasses }, () => [{} as Tile]),
    masses = tiles.map((landMassTiles) => new LandMass(landMassTiles)),
    sea = {} as Tile,
    players = sides.map(() => new Player(ruleRegistry)),
    side = (player: Player): Side => sides[players.indexOf(player)],
    gold = new Map(
      players.map((player, index) => [player, sides[index].gold ?? 0])
    ),
    advances = new Map(
      players.map((player, index) => [
        player,
        [...(sides[index].advances ?? [])],
      ])
    ),
    units = new Map(
      players.map((player, index) => [
        player,
        (sides[index].units ?? []).map(({ on, attack, defence, nuclear }) =>
          Object.assign(Object.create(Unit.prototype), {
            nuclear: nuclear ?? false,
            attack: () => ({ value: () => attack }),
            defence: () => ({ value: () => defence }),
            player: () => player,
            tile: () => (on === null ? sea : tiles[on][0]),
          })
        ),
      ])
    ),
    cities = new Map(
      players.map((player, index) => [
        player,
        (sides[index].cities ?? []).map((on) => ({
          player: () => player,
          tile: () => tiles[on][0],
        })),
      ])
    );

  ruleRegistry.register(
    new MilitaryStrength(
      new Effect((unit: Unit) => ({
        attack: unit.attack().value(),
        defence: unit.defence().value(),
      }))
    ),
    new Rank(new Effect((player: Player) => side(player).rank ?? 0)),
    ...pacified.map(
      ([who, towards]) =>
        new Pacified(
          new Criterion(
            (player: Player, other: Player) =>
              player === players[who] && other === players[towards]
          ),
          new Effect(() => true)
        )
    )
  );

  const dependencies = {
    cityRegistry: {
      getByPlayer: (player: Player) => cities.get(player) ?? [],
    },
    clientRegistry: {
      getBy: (key: string, player: Player) => [
        side(player).human ? {} : Object.create(AIClient.prototype),
      ],
    },
    interactionRegistry,
    landMassRegistry: { entries: () => masses },
    playerGovernmentRegistry: {
      getByPlayer: (player: Player) => ({
        is: () => side(player).senate ?? false,
      }),
    },
    playerRegistry: { entries: () => players },
    playerResearchRegistry: {
      getByPlayer: (player: Player) => ({
        complete: () =>
          advances.get(player)!.map((AdvanceType) => ({
            sourceClass: () => AdvanceType,
          })),
        completed: (AdvanceType: typeof Advance) =>
          advances.get(player)!.includes(AdvanceType),
        addAdvance: (AdvanceType: typeof Advance) =>
          advances.get(player)!.push(AdvanceType),
      }),
    },
    playerTreasuryRegistry: {
      getByPlayerAndType: (player: Player) => ({
        value: () => gold.get(player)!,
        add: (value: number) => gold.set(player, gold.get(player)! + value),
        subtract: (value: number) =>
          gold.set(player, gold.get(player)! - value),
      }),
    },
    ruleRegistry,
    traitRegistry: { getByLeader: () => [] },
    turn: { value: () => turn },
    unitRegistry: { getByPlayer: (player: Player) => units.get(player) ?? [] },
  } as unknown as Dependencies;

  const readers: Readers = {
    isHuman: (player) => side(player).human ?? false,
    nuclear: (player) =>
      (units.get(player) ?? []).filter((unit) => unit.nuclear).length,
    mood: (player) => side(player).mood ?? 0,
    hasSenate: (player) => side(player).senate ?? false,
    level: () => level,
  };

  return {
    advances,
    dependencies,
    gold,
    interactionRegistry,
    players,
    readers,
    ruleRegistry,
  };
};

export default position;
