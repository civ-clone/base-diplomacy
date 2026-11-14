"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expiredRules = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Expired_1 = require("@civ-clone/core-diplomacy/Rules/Declaration/Expired");
const Peace_1 = require("@civ-clone/base-diplomacy-declaration-peace/Peace");
const ShamPeace_1 = require("@civ-clone/library-diplomacy/Declarations/ShamPeace");
/**
 * `<prefix>:declaration/expired/announce`: the engine's listeners hear of a treaty that ended, and who ended it (`by`,
 *  if anyone did: whoever breaks a treaty isn't told they've been attacked). A peace dropped by a player that only
 *  pretended to keep it ends unannounced (`turnStartRules`), as does the pretence itself.
 */
const expiredRules = (prefix, engine, interactionRegistry) => [
    new Expired_1.default(`${prefix}:declaration/expired/announce`, new Criterion_1.default((declaration) => !(declaration instanceof ShamPeace_1.default) &&
        !(declaration instanceof Peace_1.default &&
            interactionRegistry
                .getByPlayers(...declaration.players())
                .some((interaction) => interaction instanceof ShamPeace_1.default && interaction.active()))), new Effect_1.default((declaration, by = null) => {
        engine.emit('diplomacy:declaration-expired', declaration, by);
        declaration
            .players()
            .forEach((player) => engine.emit('player:declaration-expired', player, declaration, by));
    })),
];
exports.expiredRules = expiredRules;
exports.default = exports.expiredRules;
//# sourceMappingURL=expired.js.map