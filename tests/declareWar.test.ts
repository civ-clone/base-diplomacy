import { activeDeclarations, declareWar, makePeace } from '../lib/declareWar';
import { dropShamPeace } from '../lib/shamPeace';
import Never from '@civ-clone/core-diplomacy/Expiries/Never';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import ShamPeace from '@civ-clone/library-diplomacy/Declarations/ShamPeace';
import War from '@civ-clone/base-diplomacy-declaration-war/War';
import { expect } from 'chai';
import position from './lib/position';

describe('declareWar', (): void => {
  it('ends the treaty and any sham peace, and declares war', (): void => {
    const { dependencies, interactionRegistry, players, ruleRegistry } =
        position([{}, {}]),
      [a, b] = players;

    makePeace(dependencies, a, b);
    makePeace(dependencies, a, b);

    expect(activeDeclarations(dependencies, Peace, a, b)).length(1);

    interactionRegistry.register(
      new ShamPeace(a, b, new Never(), ruleRegistry)
    );

    declareWar(dependencies, a, b);

    expect(activeDeclarations(dependencies, Peace, a, b)).length(0);
    expect(activeDeclarations(dependencies, ShamPeace, a, b)).length(0);
    expect(activeDeclarations(dependencies, War, a, b)).length(1);
  });
});

describe('dropShamPeace', (): void => {
  it('drops a sham peace and its treaty with the given chance, asking only while the treaty stands', (): void => {
    const { dependencies, interactionRegistry, players, ruleRegistry } =
        position([{}, {}]),
      [a, b] = players;
    let asked = 0;

    makePeace(dependencies, a, b);
    interactionRegistry.register(
      new ShamPeace(a, b, new Never(), ruleRegistry)
    );

    dropShamPeace(dependencies, a, () => (asked++, 0.5), 0.25);

    expect(asked).equal(1);
    expect(activeDeclarations(dependencies, Peace, a, b)).length(1);

    // Only its holder drops it.
    dropShamPeace(dependencies, b, () => (asked++, 0), 0.25);

    expect(asked).equal(1);

    dropShamPeace(dependencies, a, () => (asked++, 0.2), 0.25);

    expect(asked).equal(2);
    expect(activeDeclarations(dependencies, Peace, a, b)).length(0);
    expect(activeDeclarations(dependencies, ShamPeace, a, b)).length(0);

    // With no treaty left, a sham goes without asking.
    interactionRegistry.register(
      new ShamPeace(a, b, new Never(), ruleRegistry)
    );

    dropShamPeace(dependencies, a, () => (asked++, 0.9), 0.25);

    expect(asked).equal(2);
    expect(activeDeclarations(dependencies, ShamPeace, a, b)).length(0);
  });
});
