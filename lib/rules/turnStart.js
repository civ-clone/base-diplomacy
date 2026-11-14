"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turnStartRules = void 0;
const Effect_1 = require("@civ-clone/core-rule/Effect");
const TurnStart_1 = require("@civ-clone/core-player/Rules/TurnStart");
const shamPeace_1 = require("../shamPeace");
/**
 * `<prefix>:player/turn-start/drop-sham-peace`: a computer player keeping a peace it means to break drops it, without a
 *  word, with chance `chance` each turn (`dropShamPeace`).
 */
const turnStartRules = (prefix, dependencies, random, chance) => [
    new TurnStart_1.default(`${prefix}:player/turn-start/drop-sham-peace`, new Effect_1.default((player) => (0, shamPeace_1.default)(dependencies, player, random, chance))),
];
exports.turnStartRules = turnStartRules;
exports.default = exports.turnStartRules;
//# sourceMappingURL=turnStart.js.map