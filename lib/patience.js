"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patience = void 0;
const PatienceRecord_1 = require("../Records/PatienceRecord");
/**
 * `holder`'s patience with `toward`: how much of it they've used up, in one direction, kept between meetings and saved
 *  (`PatienceRecord`). How much there is to spend, and what spends it, is the rule set's. Nothing is written until
 *  some is spent, so a rule set that never calls this saves nothing.
 */
const patience = ({ interactionRegistry, ruleRegistry, turn, }, holder, toward) => {
    const record = () => interactionRegistry
        .getByPlayers(holder, toward)
        .find((interaction) => interaction instanceof PatienceRecord_1.default &&
        interaction.holder() === holder &&
        interaction.toward() === toward), spent = () => { var _a, _b; return (_b = (_a = record()) === null || _a === void 0 ? void 0 : _a.value()) !== null && _b !== void 0 ? _b : 0; }, set = (value) => {
        const existing = record();
        if (existing !== undefined) {
            existing.setSpent(value);
            return;
        }
        if (value === 0) {
            return;
        }
        interactionRegistry.register(new PatienceRecord_1.default(holder, toward, value, ...[ruleRegistry, turn].filter((arg) => arg !== undefined)));
    };
    return {
        spent,
        spend: (amount = 1) => {
            const value = Math.max(0, spent() + amount);
            set(value);
            return value;
        },
        reset: () => set(0),
    };
};
exports.patience = patience;
exports.default = exports.patience;
//# sourceMappingURL=patience.js.map