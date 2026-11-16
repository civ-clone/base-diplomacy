"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeclaredWar = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * `by` has declared war on `against` (`declareWar`). `forced` when it was made to: by something it did under a
 *  treaty (an attack, an incident) rather than by choosing war, so that a rule set can count it against its
 *  reputation either way. Processed once the war is declared; with no rule registered, nothing more happens.
 */
class DeclaredWar extends Rule_1.default {
}
exports.DeclaredWar = DeclaredWar;
exports.default = DeclaredWar;
//# sourceMappingURL=DeclaredWar.js.map