import {
  TreatyLevel,
  hasTreatyLevel,
  treatyLevel,
  treatyName,
} from '../lib/treatyLevel';
import {
  activeDeclarations,
  cancelAlliance,
  declareWar,
  makeAlliance,
  makeCeasefire,
  makePeace,
} from '../lib/declareWar';
import { atPeace, atWar } from '../lib/standing';
import Alliance from '@civ-clone/base-diplomacy-declaration-alliance/Alliance';
import Ceasefire from '@civ-clone/base-diplomacy-declaration-ceasefire/Ceasefire';
import Contact from '@civ-clone/base-diplomacy-interaction-contact/Contact';
import DeclaredWar from '../Rules/DeclaredWar';
import Effect from '@civ-clone/core-rule/Effect';
import Never from '@civ-clone/core-diplomacy/Expiries/Never';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
import War from '@civ-clone/base-diplomacy-declaration-war/War';
import { expect } from 'chai';
import position from './lib/position';

// A unit that only knows its player, which is all `Contact` asks of one.
const unitOf = (player: Player): Unit =>
  Object.assign(Object.create(Unit.prototype), { player: () => player });

// Three players, the first two of whom have met.
const met = () => {
  const setUp = position([{}, {}, {}]),
    [a, b] = setUp.players;

  setUp.interactionRegistry.register(new Contact(unitOf(a), unitOf(b)));

  return setUp;
};

describe('treatyLevel', (): void => {
  it('orders the levels from war to alliance, and names them', (): void => {
    expect(TreatyLevel.War < TreatyLevel.Contact).true;
    expect(TreatyLevel.Contact < TreatyLevel.Ceasefire).true;
    expect(TreatyLevel.Ceasefire < TreatyLevel.Peace).true;
    expect(TreatyLevel.Peace < TreatyLevel.Alliance).true;
    expect(
      [
        TreatyLevel.War,
        TreatyLevel.Contact,
        TreatyLevel.Ceasefire,
        TreatyLevel.Peace,
        TreatyLevel.Alliance,
      ].map(treatyName)
    ).to.deep.equal(['war', 'contact', 'ceasefire', 'peace', 'alliance']);
  });

  it('is contact with nothing in force, and war with only a war', (): void => {
    const { dependencies, players } = met(),
      [a, b, c] = players;

    expect(treatyLevel(dependencies, a, b)).equal(TreatyLevel.Contact);
    expect(treatyLevel(dependencies, a, c)).equal(TreatyLevel.Contact);

    declareWar(dependencies, a, b);

    expect(treatyLevel(dependencies, a, b)).equal(TreatyLevel.War);
    expect(treatyLevel(dependencies, b, a)).equal(TreatyLevel.War);
    // The pair's Contact comes before the War in their list: it mustn't be taken for the answer.
    expect(hasTreatyLevel(dependencies, a, b, TreatyLevel.Contact)).false;
    expect(hasTreatyLevel(dependencies, a, b, TreatyLevel.War)).true;
    expect(hasTreatyLevel(dependencies, a, c, TreatyLevel.Contact)).true;
    expect(hasTreatyLevel(dependencies, a, c, TreatyLevel.Ceasefire)).false;
  });

  it('answers the highest treaty in force, an alliance over the peace beside it', (): void => {
    const { dependencies, players } = met(),
      [a, b] = players;

    declareWar(dependencies, a, b);
    makeCeasefire(dependencies, a, b);

    expect(treatyLevel(dependencies, a, b)).equal(TreatyLevel.Ceasefire);
    expect(hasTreatyLevel(dependencies, a, b, TreatyLevel.Ceasefire)).true;
    expect(hasTreatyLevel(dependencies, a, b, TreatyLevel.Peace)).false;
    // A ceasefire ends the war it stops.
    expect(activeDeclarations(dependencies, War, a, b)).length(0);

    makePeace(dependencies, a, b);

    expect(treatyLevel(dependencies, a, b)).equal(TreatyLevel.Peace);

    makeAlliance(dependencies, b, a);

    expect(treatyLevel(dependencies, a, b)).equal(TreatyLevel.Alliance);
    expect(hasTreatyLevel(dependencies, a, b, TreatyLevel.Peace)).true;
    expect(hasTreatyLevel(dependencies, a, b, TreatyLevel.Alliance)).true;
    // The alliance stands beside the one peace, and the ceasefire is over.
    expect(activeDeclarations(dependencies, Peace, a, b)).length(2);
    expect(activeDeclarations(dependencies, Alliance, a, b)).length(1);
    expect(activeDeclarations(dependencies, Ceasefire, a, b)).length(0);
  });

  it('leaves the pair in contact, not at war, when a ceasefire lapses', (): void => {
    const { dependencies, players } = met(),
      [a, b] = players;

    declareWar(dependencies, a, b);
    makeCeasefire(dependencies, a, b);
    makeCeasefire(dependencies, a, b);

    const [ceasefire] = activeDeclarations(dependencies, Ceasefire, a, b);

    expect(activeDeclarations(dependencies, Ceasefire, a, b)).length(1);

    ceasefire.expire();

    expect(treatyLevel(dependencies, a, b)).equal(TreatyLevel.Contact);
  });

  it('leaves allies at peace when the alliance is cancelled, even an alliance that stood alone', (): void => {
    const { dependencies, interactionRegistry, players, ruleRegistry } = met(),
      [a, b] = players;

    makeAlliance(dependencies, a, b);
    makeAlliance(dependencies, a, b);

    expect(activeDeclarations(dependencies, Alliance, a, b)).length(1);

    cancelAlliance(dependencies, b, a);

    expect(treatyLevel(dependencies, a, b)).equal(TreatyLevel.Peace);
    expect(atPeace(dependencies, a, b)).true;

    // An alliance registered with no peace of its own.
    const [, , c] = players;

    interactionRegistry.register(new Alliance(a, c, new Never(), ruleRegistry));

    expect(treatyLevel(dependencies, a, c)).equal(TreatyLevel.Alliance);

    cancelAlliance(dependencies, a, c);

    expect(treatyLevel(dependencies, a, c)).equal(TreatyLevel.Peace);
    expect(activeDeclarations(dependencies, Peace, a, c)).length(1);
  });

  it('ends every treaty with a declaration of war', (): void => {
    const { dependencies, players } = met(),
      [a, b] = players;

    makeAlliance(dependencies, a, b);
    declareWar(dependencies, b, a);

    expect(treatyLevel(dependencies, a, b)).equal(TreatyLevel.War);
    expect(activeDeclarations(dependencies, Peace, a, b)).length(0);
    expect(atWar(dependencies, a, b)).true;
  });

  it("keeps atPeace and atWar's answers for peace alone, as Civ1 has it", (): void => {
    const { dependencies, players } = met(),
      [a, b, c] = players;

    expect(atPeace(dependencies, a, b)).false;
    expect(atWar(dependencies, a, b)).true;
    // Never met: neither.
    expect(atWar(dependencies, a, c)).false;

    makePeace(dependencies, a, b);

    expect(atPeace(dependencies, a, b)).true;
    expect(atWar(dependencies, a, b)).false;

    declareWar(dependencies, a, b);

    expect(atPeace(dependencies, a, b)).false;
    expect(atWar(dependencies, a, b)).true;
  });
});

describe('treaties and ceasefires', (): void => {
  it('ends a ceasefire with a peace', (): void => {
    const { dependencies, players } = met(),
      [a, b] = players;

    declareWar(dependencies, a, b);
    makeCeasefire(dependencies, a, b);
    makePeace(dependencies, b, a);

    expect(activeDeclarations(dependencies, Ceasefire, a, b)).length(0);
    expect(activeDeclarations(dependencies, Peace, a, b)).length(1);
    expect(treatyLevel(dependencies, a, b)).equal(TreatyLevel.Peace);
  });

  it('makes no peace when there is no alliance to cancel', (): void => {
    const { dependencies, players } = met(),
      [a, b] = players;

    cancelAlliance(dependencies, a, b);

    expect(activeDeclarations(dependencies, Peace, a, b)).length(0);
    expect(treatyLevel(dependencies, a, b)).equal(TreatyLevel.Contact);
  });

  it('finds a ceasefire listed after a war, and the pair is not at war', (): void => {
    const { dependencies, interactionRegistry, players, ruleRegistry } = met(),
      [a, b] = players;

    // Registered directly, so the war is still in force and comes first in the pair's list.
    interactionRegistry.register(
      new War(a, b, new Never(), ruleRegistry),
      new Ceasefire(a, b, new Never(), ruleRegistry)
    );

    expect(hasTreatyLevel(dependencies, a, b, TreatyLevel.Ceasefire)).true;
    expect(hasTreatyLevel(dependencies, a, b, TreatyLevel.Peace)).false;
    expect(treatyLevel(dependencies, a, b)).equal(TreatyLevel.Ceasefire);
    expect(atWar(dependencies, a, b)).false;
    expect(atPeace(dependencies, a, b)).false;
  });
});

describe('declareWar', (): void => {
  it('tells the DeclaredWar rules who declared on whom, and whether they were made to', (): void => {
    const { dependencies, players, ruleRegistry } = met(),
      [a, b] = players,
      heard: [Player, Player, boolean, TreatyLevel][] = [];

    ruleRegistry.register(
      new DeclaredWar(
        new Effect(
          (
            by: Player,
            against: Player,
            forced: boolean,
            broken: TreatyLevel
          ): void => {
            // The war is declared by the time it's heard.
            expect(treatyLevel(dependencies, by, against)).equal(
              TreatyLevel.War
            );

            heard.push([by, against, forced, broken]);
          }
        )
      )
    );

    makeAlliance(dependencies, a, b);
    declareWar(dependencies, a, b);
    declareWar(dependencies, b, a, true);
    makeCeasefire(dependencies, a, b);
    declareWar(dependencies, a, b);
    makePeace(dependencies, a, b);
    declareWar(dependencies, a, b);

    // The level each declaration broke, as it stood before.
    expect(heard).to.deep.equal([
      [a, b, false, TreatyLevel.Alliance],
      [b, a, true, TreatyLevel.War],
      [a, b, false, TreatyLevel.Ceasefire],
      [a, b, false, TreatyLevel.Peace],
    ]);
  });
});
