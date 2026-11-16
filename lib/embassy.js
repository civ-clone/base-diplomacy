"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasEmbassy = void 0;
const Embassy_1 = require("@civ-clone/base-unit-action-establish-embassy/Embassy");
const HasEmbassy_1 = require("../Rules/HasEmbassy");
/**
 * Whether `player` has an embassy with `other`: an `Embassy` it holds there, or, failing that, any `HasEmbassy` rule
 *  answering `true` (a wonder that acts as an embassy with everyone, say). One way, as an `Embassy` is. With no
 *  `ruleRegistry`, or no `HasEmbassy` rule, only an `Embassy` counts.
 */
const hasEmbassy = ({ interactionRegistry, ruleRegistry, }, player, other) => interactionRegistry
    .getByPlayers(player, other)
    .some((interaction) => interaction instanceof Embassy_1.default &&
    interaction.holder() === player) ||
    (ruleRegistry !== undefined &&
        ruleRegistry
            .process(HasEmbassy_1.default, player, other)
            .some((answer) => answer));
exports.hasEmbassy = hasEmbassy;
exports.default = exports.hasEmbassy;
//# sourceMappingURL=embassy.js.map