"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactOnMove = void 0;
const Contact_1 = require("@civ-clone/base-diplomacy-interaction-contact/Contact");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
// Contact made by units moving next to each other, for a `Moved` rule. Each call keeps its own record of who has met.
const contactOnMove = (interactionRegistry, unitRegistry) => {
    // The players each player has a `Contact` with, filled in from the registry the first time a pair is asked about.
    const met = new WeakMap(), metOf = (player) => {
        if (!met.has(player)) {
            met.set(player, new WeakSet());
        }
        return met.get(player);
    }, 
    // Whether the two have a `Contact` already: one is all "having met" needs (`standing`). A unit moving back and
    //  forth beside another player's added one with every step, and a late game held tens of thousands of them, each
    //  slowing every search of the registry (civ-clone/web-renderer#377).
    inContact = (player, other) => {
        if (metOf(player).has(other)) {
            return true;
        }
        const found = interactionRegistry
            .getByPlayers(player, other)
            .some((interaction) => interaction instanceof Contact_1.default);
        if (found) {
            metOf(player).add(other);
            metOf(other).add(player);
        }
        return found;
    };
    return {
        canMakeContact: (unit) => !(0, isBarbarian_1.default)(unit.player()),
        besideAnother: (unit) => unit
            .tile()
            .getNeighbours()
            .some((tile) => unitRegistry
            .getByTile(tile)
            .some((tileUnit) => tileUnit.player() !== unit.player() &&
            !(0, isBarbarian_1.default)(tileUnit.player()))),
        makeContact: (unit) => unit
            .tile()
            .getNeighbours()
            .forEach((tile) => unitRegistry
            .getByTile(tile)
            .filter((tileUnit) => tileUnit.player() !== unit.player() &&
            !(0, isBarbarian_1.default)(tileUnit.player()))
            .forEach((tileUnit) => {
            if (inContact(unit.player(), tileUnit.player())) {
                return;
            }
            interactionRegistry.register(new Contact_1.default(unit, tileUnit));
            metOf(unit.player()).add(tileUnit.player());
            metOf(tileUnit.player()).add(unit.player());
        })),
    };
};
exports.contactOnMove = contactOnMove;
exports.default = exports.contactOnMove;
//# sourceMappingURL=contact.js.map