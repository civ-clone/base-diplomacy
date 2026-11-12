"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.give = exports.advancesLacked = void 0;
const Gold_1 = require("@civ-clone/base-city-yield-gold/Gold");
// The advances `from` knows and `by` doesn't, leaving out repeatable ones.
const advancesLacked = (dependencies, from, by) => {
    const byResearch = dependencies.playerResearchRegistry.getByPlayer(by);
    return dependencies.playerResearchRegistry
        .getByPlayer(from)
        .complete()
        .filter((advance) => {
        const AdvanceType = advance.sourceClass();
        return !AdvanceType.repeatable && !byResearch.completed(AdvanceType);
    });
};
exports.advancesLacked = advancesLacked;
// `from` gives `to` gold, or an advance.
const give = (dependencies, gift, from, to) => {
    if (gift instanceof Gold_1.default) {
        dependencies.playerTreasuryRegistry
            .getByPlayerAndType(from, Gold_1.default)
            .subtract(gift.value());
        dependencies.playerTreasuryRegistry
            .getByPlayerAndType(to, Gold_1.default)
            .add(gift.value());
        return;
    }
    dependencies.playerResearchRegistry
        .getByPlayer(to)
        .addAdvance(gift.sourceClass());
};
exports.give = give;
//# sourceMappingURL=knowledge.js.map