import { StanceNumbers, stance } from '../lib/stance';
import Contact from '@civ-clone/base-diplomacy-interaction-contact/Contact';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
import { expect } from 'chai';
import position from './lib/position';
import wouldGoToWar from '../lib/wouldGoToWar';

// Stand-in numbers, not any ruleset's.
const numbers: StanceNumbers = {
  fearWeight: (level: number): number => level + 1,
  ultimatumTurn: 10,
  ultimatumCities: 1,
  topRanking: 3,
  nuclearTribute: 40,
  nuclearFear: 5,
  tributeDivisor: 10,
  tributeUnit: 10,
  tributeUnits: 5,
};

// Land mass 1: the first side's two cities, attack 20, beside the second side's city and its attack 4.
const threatening = (first = {}, second = {}) =>
  position([
    { cities: [1, 1], units: [{ on: 1, attack: 20, defence: 5 }], ...first },
    {
      human: true,
      gold: 500,
      cities: [1],
      units: [{ on: 1, attack: 4, defence: 4 }],
      ...second,
    },
  ]);

describe('stance', (): void => {
  it('fears for cities it cannot hold, by the weight for the level', (): void => {
    const { dependencies, players, readers } = position([
        { cities: [0, 0], units: [{ on: 0, attack: 1, defence: 2 }] },
        { human: true, units: [{ on: 0, attack: 10, defence: 1 }] },
      ]),
      result = stance(dependencies, readers, numbers, players[0], players[1]);

    // 10 × (3 + 1) / (2 + 1)
    expect(result.fear).equal(13);
    expect(result.hostile).false;
    expect(result.mode).equal(0);
  });

  it('demands what it could take, scaled and counted in tribute units, at most `tributeUnits`', (): void => {
    const { dependencies, players, readers } = threatening(),
      result = stance(dependencies, readers, numbers, players[0], players[1]);

    // 20 − 4 = 16; 16 × 4 / 10 = 6, at most 5 units of 10.
    expect(result.tribute).equal(50);
    expect(result.hostile).true;
    expect(result.mode).equal(2);
  });

  it('changes government rather than back down when its senate would stop it', (): void => {
    const { dependencies, players, readers } = threatening({ senate: true }),
      changed: Player[] = [];

    const result = stance(
      dependencies,
      readers,
      numbers,
      players[0],
      players[1],
      null,
      (player) => changed.push(player)
    );

    expect(changed).eql([players[0]]);
    expect(result.hostile).true;
  });

  it('tosses one coin when it wants peace, and may waive the tribute', (): void => {
    const { dependencies, players, readers } = threatening({ mood: -3 });
    let tossed = 0;

    const result = stance(
      dependencies,
      readers,
      numbers,
      players[0],
      players[1],
      () => (tossed++, 0.1)
    );

    expect(tossed).equal(1);
    expect(result.hostile).false;
    expect(result.wasHostile).true;
    expect(result.tribute).equal(0);
  });

  it('demands at least `nuclearTribute` of a player without nuclear weapons', (): void => {
    const { dependencies, players, readers } = position([
      { units: [{ on: 0, attack: 1, defence: 1, nuclear: true }] },
      { human: true, gold: 500, units: [{ on: 0, attack: 1, defence: 1 }] },
    ]);

    // 40 × 4 / 10 = 16, at most 5 units of 10.
    expect(
      stance(dependencies, readers, numbers, players[0], players[1]).tribute
    ).equal(50);
  });
});

describe('wouldGoToWar', (): void => {
  const contested = () =>
    position([
      { cities: [0], units: [{ on: 0, attack: 10, defence: 1 }] },
      { units: [{ on: 0, attack: 1, defence: 1 }] },
      { human: true, units: [{ on: 2, attack: 50, defence: 50 }] },
    ]);

  it('goes to war when four times its attack over their strength reaches the threshold', (): void => {
    const { dependencies, players, readers } = contested();

    // 10 × 4 / (1 + 0 + 1) = 20.
    expect(wouldGoToWar(dependencies, readers, 20, players[0], players[1]))
      .true;
    expect(wouldGoToWar(dependencies, readers, 21, players[0], players[1]))
      .false;
  });

  it("won't weaken a fellow enemy of a person's player", (): void => {
    const { dependencies, interactionRegistry, players, readers } = contested();

    interactionRegistry.register(
      new Contact(
        { player: () => players[1] } as unknown as Unit,
        { player: () => players[2] } as unknown as Unit
      )
    );

    expect(wouldGoToWar(dependencies, readers, 4, players[0], players[1]))
      .false;
  });
});
