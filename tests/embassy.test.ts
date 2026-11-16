import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Embassy from '@civ-clone/base-unit-action-establish-embassy/Embassy';
import HasEmbassy from '../Rules/HasEmbassy';
import Player from '@civ-clone/core-player/Player';
import { expect } from 'chai';
import hasEmbassy from '../lib/embassy';
import position from './lib/position';

describe('hasEmbassy', (): void => {
  it('is an Embassy held there, one way', (): void => {
    const { dependencies, interactionRegistry, players, ruleRegistry } =
        position([{}, {}]),
      [a, b] = players;

    expect(hasEmbassy(dependencies, a, b)).false;

    interactionRegistry.register(new Embassy(a, b, ruleRegistry));

    expect(hasEmbassy(dependencies, a, b)).true;
    expect(hasEmbassy(dependencies, b, a)).false;
    expect(hasEmbassy({ interactionRegistry }, a, b)).true;
  });

  it('is also any HasEmbassy rule answering yes', (): void => {
    const { dependencies, interactionRegistry, players, ruleRegistry } =
        position([{}, {}, {}]),
      [a, b, c] = players;

    ruleRegistry.register(
      new HasEmbassy(
        new Criterion((player: Player) => player === a),
        new Effect(() => true)
      ),
      new HasEmbassy(new Effect(() => false))
    );

    expect(hasEmbassy(dependencies, a, b)).true;
    expect(hasEmbassy(dependencies, a, c)).true;
    expect(hasEmbassy(dependencies, b, a)).false;
    // Without the rules, only an Embassy counts.
    expect(hasEmbassy({ interactionRegistry }, a, b)).false;
  });
});
