"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordContact = exports.lastContact = void 0;
const LastContactRecord_1 = require("../Records/LastContactRecord");
const recordOf = (interactionRegistry, player, other) => interactionRegistry
    .getByPlayers(player, other)
    .find((interaction) => interaction instanceof LastContactRecord_1.default);
/**
 * The turn `player` and `other` were last in contact, as a rule set records it (`recordContact`), or `undefined` if it
 *  never has. The same both ways.
 */
const lastContact = ({ interactionRegistry }, player, other) => { var _a; return (_a = recordOf(interactionRegistry, player, other)) === null || _a === void 0 ? void 0 : _a.value(); };
exports.lastContact = lastContact;
/**
 * Records that `player` and `other` were in contact on `turn` (`LastContactRecord`, saved). Nothing is written until a
 *  rule set records one.
 */
const recordContact = ({ interactionRegistry, ruleRegistry, turn: gameTurn }, player, other, turn) => {
    const existing = recordOf(interactionRegistry, player, other);
    if (existing !== undefined) {
        existing.setLastContact(turn);
        return;
    }
    interactionRegistry.register(new LastContactRecord_1.default(player, other, turn, ...[ruleRegistry, gameTurn].filter((arg) => arg !== undefined)));
};
exports.recordContact = recordContact;
exports.default = exports.lastContact;
//# sourceMappingURL=lastContact.js.map