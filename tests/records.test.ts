import { lastContact, recordContact } from '../lib/lastContact';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import LastContactRecord from '../Records/LastContactRecord';
import PatienceRecord from '../Records/PatienceRecord';
import Player from '@civ-clone/core-player/Player';
import RelationRecord from '@civ-clone/core-diplomacy/Records/RelationRecord';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import { expect } from 'chai';
import patience from '../lib/patience';

const setUp = () => {
  const interactionRegistry = new InteractionRegistry(),
    ruleRegistry = new RuleRegistry(),
    turn = new Turn(),
    players = [0, 1, 2].map(() => new Player(ruleRegistry));

  return {
    registries: { interactionRegistry, ruleRegistry, turn },
    interactionRegistry,
    players,
    ruleRegistry,
    turn,
  };
};

// What core-save-game does, in small (as core-diplomacy's own test): the saved fields (`stateKeys()`) through JSON,
//  players as references and sets as lists, read back with `Object.create` and no constructor, and the transient
//  collaborators supplied as `Game.inject` does.
const saveAndLoad = (
  interactionRegistry: InteractionRegistry,
  players: Player[],
  ruleRegistry: RuleRegistry,
  turn: Turn
): InteractionRegistry => {
  const encode = (value: unknown): unknown =>
      value instanceof Player
        ? { $ref: value.id() }
        : value instanceof Set
        ? { $set: Array.from(value).map(encode) }
        : Array.isArray(value)
        ? value.map(encode)
        : value,
    decode = (value: any): unknown =>
      Array.isArray(value)
        ? value.map(decode)
        : value !== null && typeof value === 'object' && '$ref' in value
        ? players.find((player) => player.id() === value.$ref)
        : value !== null && typeof value === 'object' && '$set' in value
        ? new Set(value.$set.map(decode))
        : value,
    classes = new Map<string, Function>(
      [PatienceRecord, LastContactRecord].map((Type) => [Type.name, Type])
    ),
    file = JSON.stringify(
      interactionRegistry.entries().map((entity) => ({
        type: entity.constructor.name,
        id: entity.id(),
        keys: (entity as any)._keys,
        state: Object.fromEntries(
          entity.stateKeys().map((key) => [key, encode((entity as any)[key])])
        ),
      }))
    ),
    loaded = new InteractionRegistry();

  JSON.parse(file).forEach(({ type, id, keys, state }: any): void => {
    const entity = Object.create(classes.get(type)!.prototype);

    Object.entries(state).forEach(([key, value]) => {
      entity[key] = decode(value);
    });

    Object.assign(entity, {
      _id: id,
      _keys: keys,
      _ruleRegistry: ruleRegistry,
      _turn: turn,
    });

    loaded.register(entity);
  });

  return loaded;
};

describe('patience', (): void => {
  it('writes nothing until some is spent, then keeps one record per direction', (): void => {
    const { registries, interactionRegistry, players } = setUp(),
      [a, b] = players,
      aWithB = patience(registries, a, b);

    expect(aWithB.spent()).equal(0);

    aWithB.reset();
    aWithB.spend(0);

    expect(interactionRegistry.entries()).length(0);

    expect(aWithB.spend()).equal(1);
    expect(aWithB.spend(2)).equal(3);
    expect(patience(registries, a, b).spent()).equal(3);
    expect(patience(registries, b, a).spent()).equal(0);

    // Some given back, never below nothing.
    expect(aWithB.spend(-1)).equal(2);
    expect(aWithB.spend(-5)).equal(0);

    aWithB.spend(4);
    patience(registries, b, a).spend();

    const records = interactionRegistry.entries();

    expect(records).length(2);
    expect(records.every((record) => record instanceof RelationRecord)).true;

    aWithB.reset();

    expect(aWithB.spent()).equal(0);
    expect(patience(registries, b, a).spent()).equal(1);
  });
});

describe('lastContact', (): void => {
  it('is undefined until recorded, then the same both ways', (): void => {
    const { registries, interactionRegistry, players } = setUp(),
      [a, b, c] = players;

    expect(lastContact(registries, a, b)).undefined;
    expect(interactionRegistry.entries()).length(0);

    recordContact(registries, a, b, 12);

    expect(lastContact(registries, a, b)).equal(12);
    expect(lastContact(registries, b, a)).equal(12);
    expect(lastContact(registries, a, c)).undefined;

    recordContact(registries, b, a, 30);

    expect(lastContact(registries, a, b)).equal(30);
    expect(interactionRegistry.entries()).length(1);
  });
});

describe('patience and last contact in a saved game', (): void => {
  it('come back from a save as they were', (): void => {
    const { registries, interactionRegistry, players, ruleRegistry, turn } =
        setUp(),
      [a, b, c] = players;

    patience(registries, a, b).spend(3);
    patience(registries, b, a).spend(1);
    recordContact(registries, a, c, 17);

    const loaded = saveAndLoad(
        interactionRegistry,
        players,
        ruleRegistry,
        turn
      ),
      reloaded = { interactionRegistry: loaded, ruleRegistry, turn };

    expect(loaded.entries()).length(3);
    expect(patience(reloaded, a, b).spent()).equal(3);
    expect(patience(reloaded, b, a).spent()).equal(1);
    expect(lastContact(reloaded, c, a)).equal(17);

    patience(reloaded, a, b).spend();
    recordContact(reloaded, a, c, 20);

    expect(patience(reloaded, a, b).spent()).equal(4);
    expect(lastContact(reloaded, a, c)).equal(20);
    expect(loaded.entries()).length(3);
  });
});
