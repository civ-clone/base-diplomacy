"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalAvailable = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Whether `proposal` may be offered in a meeting a person leads (`proposalMenu`): it's offered when at least one rule
 *  answers and every answer is `true`, so a proposal no rule speaks for is never offered.
 */
class ProposalAvailable extends Rule_1.default {
}
exports.ProposalAvailable = ProposalAvailable;
exports.default = ProposalAvailable;
//# sourceMappingURL=ProposalAvailable.js.map