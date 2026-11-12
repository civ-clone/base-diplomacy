import {
  atPeace,
  atWar,
  governedBy,
  haveMet,
  power,
  presence,
  presenceOn,
  rankFromTop,
  rankedFirst,
  traitScore,
  unitCount,
} from '../lib/standing';
import Contact from '@civ-clone/base-diplomacy-interaction-contact/Contact';
import Never from '@civ-clone/core-diplomacy/Expiries/Never';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Unit from '@civ-clone/core-unit/Unit';
import { expect } from 'chai';
import position from './lib/position';

describe('standing', (): void => {
  it('adds up attack, defence and cities on each land mass, and power everywhere', (): void => {
    const { dependencies, players } = position([
        {
          cities: [0, 0],
          units: [
            { on: 0, attack: 2, defence: 3 },
            { on: 0, attack: 1, defence: 1 },
            { on: null, attack: 4, defence: 4 },
          ],
        },
        {},
      ]),
      [mass] = dependencies.landMassRegistry.entries(),
      ours = presence(dependencies, players[0]).get(players[0])!;

    expect(presenceOn(ours, mass)).eql({ attack: 3, defence: 4, cities: 2 });
    expect(power(dependencies, players[0])).equal(15);
    expect(
      unitCount(
        dependencies,
        players[0],
        (unit: Unit) => unit.attack().value() > 1
      )
    ).equal(2);
  });

  it('is at war once met without a peace treaty', (): void => {
    const { dependencies, interactionRegistry, players, ruleRegistry } =
        position([{}, {}]),
      [a, b] = players;

    expect(haveMet(dependencies, a, b)).false;
    expect(atWar(dependencies, a, b)).false;

    interactionRegistry.register(
      new Contact(
        { player: () => a } as unknown as Unit,
        { player: () => b } as unknown as Unit
      )
    );

    expect(haveMet(dependencies, a, b)).true;
    expect(atWar(dependencies, a, b)).true;
    expect(atWar(dependencies, a, a)).false;

    interactionRegistry.register(new Peace(a, b, new Never(), ruleRegistry));

    expect(atPeace(dependencies, a, b)).true;
    expect(atWar(dependencies, a, b)).false;
  });

  it('ranks down from the top, never below 0', (): void => {
    const { dependencies, players } = position([
      { rank: 1 },
      { rank: 5 },
      { rank: 3 },
    ]);

    expect(rankedFirst(dependencies, players[1])).true;
    expect(rankFromTop(dependencies, players[1], 7)).equal(7);
    expect(rankFromTop(dependencies, players[0], 7)).equal(5);
    expect(rankFromTop(dependencies, players[0], 1)).equal(0);
  });

  it('scores leader traits and reads governments', (): void => {
    const { dependencies, players } = position([{ senate: true }, {}]),
      traits = [{}, {}, {}];

    Object.assign(players[0], {
      civilization: () => ({
        leader: () => ({ sourceClass: () => players[0] }),
      }),
    });
    Object.assign(dependencies.traitRegistry, { getByLeader: () => traits });

    expect(traitScore(dependencies, players[0], () => 2)).equal(6);
    expect(governedBy(dependencies, players[0])).true;
    expect(governedBy(dependencies, players[1])).false;
  });
});
