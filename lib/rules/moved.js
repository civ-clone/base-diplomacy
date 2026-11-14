"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movedRules = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const contact_1 = require("../contact");
/** A `Moved` rule making contact between players whose units meet (`contactOnMove`); the barbarians meet no one. */
const movedRules = (interactionRegistry, unitRegistry) => {
    const { canMakeContact, besideAnother, makeContact } = (0, contact_1.default)(interactionRegistry, unitRegistry);
    return [
        new Moved_1.default(new Criterion_1.default(canMakeContact), new Criterion_1.default(besideAnother), new Effect_1.default(makeContact)),
    ];
};
exports.movedRules = movedRules;
exports.default = exports.movedRules;
//# sourceMappingURL=moved.js.map