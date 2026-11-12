import Contact from '@civ-clone/base-diplomacy-interaction-contact/Contact';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import contactOnMove from '../lib/contact';
import { expect } from 'chai';

describe('contactOnMove', (): void => {
  it('makes one contact between players whose units are next to each other', (): void => {
    const ruleRegistry = new RuleRegistry(),
      interactionRegistry = new InteractionRegistry(),
      [a, b] = [new Player(ruleRegistry), new Player(ruleRegistry)],
      here = {} as Tile,
      there = {} as Tile,
      unitOf = (player: Player, tile: Tile) =>
        ({ player: () => player, tile: () => tile } as unknown as Unit),
      ours = unitOf(a, here),
      theirs = unitOf(b, there),
      friend = unitOf(a, there),
      units: Unit[] = [ours, theirs];

    Object.assign(here, { getNeighbours: () => [there] });

    const unitRegistry = {
        getByTile: (tile: Tile) => units.filter((unit) => unit.tile() === tile),
      } as unknown as UnitRegistry,
      { canMakeContact, besideAnother, makeContact } = contactOnMove(
        interactionRegistry,
        unitRegistry
      ),
      contacts = () =>
        interactionRegistry
          .getByPlayers(a, b)
          .filter((interaction) => interaction instanceof Contact);

    expect(canMakeContact(ours)).true;
    expect(besideAnother(ours)).true;

    makeContact(ours);
    makeContact(ours);

    expect(contacts()).length(1);

    units.splice(1, 1, friend);

    expect(besideAnother(ours)).false;
  });
});
