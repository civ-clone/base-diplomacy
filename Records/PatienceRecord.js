"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatienceRecord = void 0;
const RelationRecord_1 = require("@civ-clone/core-diplomacy/Records/RelationRecord");
/**
 * How much of `holder`'s patience with `toward` is spent: one direction of one pair, kept in the `InteractionRegistry`
 *  so it's saved. Made the first time any is spent (`patience`), so a game that never spends any has none.
 */
class PatienceRecord extends RelationRecord_1.RelationRecord {
    constructor(holder, toward, spent, ...args) {
        super(holder, toward, ...args);
        this._holder = holder;
        this._spent = spent;
        this._toward = toward;
        this.addKey('holder', 'toward', 'value');
    }
    holder() {
        return this._holder;
    }
    setSpent(spent) {
        this._spent = spent;
    }
    toward() {
        return this._toward;
    }
    value() {
        return this._spent;
    }
}
exports.PatienceRecord = PatienceRecord;
exports.default = PatienceRecord;
//# sourceMappingURL=PatienceRecord.js.map