"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mayNegotiateRules = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const MayNegotiate_1 = require("@civ-clone/library-diplomacy/Rules/Player/MayNegotiate");
const Peace_1 = require("@civ-clone/base-diplomacy-declaration-peace/Peace");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const mayNegotiate_1 = require("@civ-clone/library-diplomacy/lib/mayNegotiate");
/**
 * When two players may meet:
 *
 * - `<prefix>:player/may-negotiate/not-the-barbarians`: never with the barbarians (a rule that answers no, rather than
 *   a criterion on the others: with no rule applying, `mayNegotiate` says yes);
 * - `<prefix>:player/may-negotiate/with-the-human`: a computer player and a person, `spacing.withPerson` turns after
 *   they last met, or `spacing.withPersonAfterTreaty` after a treaty was signed since;
 * - `<prefix>:player/may-negotiate/computer-players`: two computer players at first contact, then `spacing.computers`
 *   turns after they last met.
 */
const mayNegotiateRules = (prefix, dependencies, isHuman, spacing) => {
    const humanInvolved = (player, other) => isHuman(player) || isHuman(other);
    return [
        new MayNegotiate_1.default(`${prefix}:player/may-negotiate/not-the-barbarians`, new Criterion_1.default((player, other) => (0, isBarbarian_1.default)(player) || (0, isBarbarian_1.default)(other)), new Effect_1.default(() => false)),
        new MayNegotiate_1.default(`${prefix}:player/may-negotiate/with-the-human`, new Criterion_1.default(humanInvolved), new Effect_1.default((player, other) => {
            const last = (0, mayNegotiate_1.lastNegotiated)(player, other, dependencies.interactionRegistry);
            if (last === null) {
                return true;
            }
            const treatySince = dependencies.interactionRegistry
                .getByPlayers(player, other)
                .some((interaction) => interaction instanceof Peace_1.default && interaction.when() >= last);
            return (dependencies.turn.value() - last >=
                (treatySince ? spacing.withPersonAfterTreaty : spacing.withPerson));
        })),
        new MayNegotiate_1.default(`${prefix}:player/may-negotiate/computer-players`, new Criterion_1.default((player, other) => !humanInvolved(player, other)), new Effect_1.default((player, other) => {
            const last = (0, mayNegotiate_1.lastNegotiated)(player, other, dependencies.interactionRegistry);
            return (last === null || dependencies.turn.value() - last >= spacing.computers);
        })),
    ];
};
exports.mayNegotiateRules = mayNegotiateRules;
exports.default = exports.mayNegotiateRules;
//# sourceMappingURL=mayNegotiate.js.map