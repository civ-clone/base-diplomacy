import Contact from '@civ-clone/base-diplomacy-interaction-contact/Contact';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

export interface ContactOnMove {
  // Barbarians make contact with no one (civ-clone/web-renderer#169).
  canMakeContact: (unit: Unit) => boolean;
  // Whether a unit of another player (not a barbarian) is next to `unit`.
  besideAnother: (unit: Unit) => boolean;
  // `unit`'s player makes contact with every player (not a barbarian) with a unit next to it, once per pair.
  makeContact: (unit: Unit) => void;
}

// Contact made by units moving next to each other, for a `Moved` rule. Each call keeps its own record of who has met.
export const contactOnMove = (
  interactionRegistry: InteractionRegistry,
  unitRegistry: UnitRegistry
): ContactOnMove => {
  // The players each player has a `Contact` with, filled in from the registry the first time a pair is asked about.
  const met = new WeakMap<Player, WeakSet<Player>>(),
    metOf = (player: Player): WeakSet<Player> => {
      if (!met.has(player)) {
        met.set(player, new WeakSet());
      }

      return met.get(player)!;
    },
    // Whether the two have a `Contact` already: one is all "having met" needs (`standing`). A unit moving back and
    //  forth beside another player's added one with every step, and a late game held tens of thousands of them, each
    //  slowing every search of the registry (civ-clone/web-renderer#377).
    inContact = (player: Player, other: Player): boolean => {
      if (metOf(player).has(other)) {
        return true;
      }

      const found = interactionRegistry
        .getByPlayers(player, other)
        .some((interaction): boolean => interaction instanceof Contact);

      if (found) {
        metOf(player).add(other);
        metOf(other).add(player);
      }

      return found;
    };

  return {
    canMakeContact: (unit: Unit): boolean => !isBarbarian(unit.player()),
    besideAnother: (unit: Unit): boolean =>
      unit
        .tile()
        .getNeighbours()
        .some((tile: Tile): boolean =>
          unitRegistry
            .getByTile(tile)
            .some(
              (tileUnit: Unit): boolean =>
                tileUnit.player() !== unit.player() &&
                !isBarbarian(tileUnit.player())
            )
        ),
    makeContact: (unit: Unit): void =>
      unit
        .tile()
        .getNeighbours()
        .forEach((tile: Tile): void =>
          unitRegistry
            .getByTile(tile)
            .filter(
              (tileUnit: Unit): boolean =>
                tileUnit.player() !== unit.player() &&
                !isBarbarian(tileUnit.player())
            )
            .forEach((tileUnit: Unit): void => {
              if (inContact(unit.player(), tileUnit.player())) {
                return;
              }

              interactionRegistry.register(new Contact(unit, tileUnit));
              metOf(unit.player()).add(tileUnit.player());
              metOf(tileUnit.player()).add(unit.player());
            })
        ),
  };
};

export default contactOnMove;
