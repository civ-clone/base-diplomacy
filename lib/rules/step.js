"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stepRules = void 0;
const meetingSteps_1 = require("../meetingSteps");
const AdvanceTaken_1 = require("../../Dialogues/AdvanceTaken");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Step_1 = require("@civ-clone/core-diplomacy/Rules/Negotiation/Step");
const exchanged_1 = require("../exchanged");
/**
 * The meeting's `Step` rules, one for each of `meetingSteps`' rows, in order: each applies while its row does and has
 *  something to say. The ruleset gives the meeting and whether a government answers to a senate; the advance a computer
 *  player took in an exchange is said with `AdvanceTaken`.
 */
const stepRules = (dependencies, rules, numbers) => (0, meetingSteps_1.meetingSteps)(dependencies, {
    meeting: rules.meeting,
    hasSenate: rules.hasSenate,
    advanceTaken: (player, advance, negotiation) => new AdvanceTaken_1.default(player, advance, negotiation, dependencies.ruleRegistry),
    takenBy: exchanged_1.takenBy,
}, numbers).map(([applies, next]) => new Step_1.default(new Criterion_1.default((negotiation) => applies(negotiation) && next(negotiation) !== null), new Effect_1.default((negotiation) => next(negotiation))));
exports.stepRules = stepRules;
exports.default = exports.stepRules;
//# sourceMappingURL=step.js.map