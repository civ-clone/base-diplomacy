"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LastContactRecord = void 0;
const RelationRecord_1 = require("@civ-clone/core-diplomacy/Records/RelationRecord");
/**
 * The turn two players were last in contact, the same both ways, kept in the `InteractionRegistry` so it's saved. Made
 *  the first time one is recorded (`recordContact`), so a game that never records one has none.
 */
class LastContactRecord extends RelationRecord_1.RelationRecord {
    constructor(player, other, lastContact, ...args) {
        super(player, other, ...args);
        this._lastContact = lastContact;
        this.addKey('value');
    }
    setLastContact(turn) {
        this._lastContact = turn;
    }
    value() {
        return this._lastContact;
    }
}
exports.LastContactRecord = LastContactRecord;
exports.default = LastContactRecord;
//# sourceMappingURL=LastContactRecord.js.map