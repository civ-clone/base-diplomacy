"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeDeclarations = exports.cancelAlliance = exports.makeAlliance = exports.makeCeasefire = exports.makePeace = exports.declareWar = void 0;
const Alliance_1 = require("@civ-clone/base-diplomacy-declaration-alliance/Alliance");
const treatyLevel_1 = require("./treatyLevel");
const Ceasefire_1 = require("@civ-clone/base-diplomacy-declaration-ceasefire/Ceasefire");
const DeclaredWar_1 = require("../Rules/DeclaredWar");
const Never_1 = require("@civ-clone/core-diplomacy/Expiries/Never");
const Peace_1 = require("@civ-clone/base-diplomacy-declaration-peace/Peace");
const ShamPeace_1 = require("@civ-clone/library-diplomacy/Declarations/ShamPeace");
const War_1 = require("@civ-clone/base-diplomacy-declaration-war/War");
const active = (dependencies, 
// Not `typeof Declaration`: a subclass with members of its own isn't assignable to it (civ-clone/web-renderer#21).
DeclarationType, ...players) => dependencies.interactionRegistry
    .getByPlayers(...players)
    .filter((interaction) => interaction instanceof DeclarationType &&
    interaction.active());
// `player` goes to war with `other`: any treaty between them ends (a ceasefire, a peace, an alliance, which is a
//  peace), and so does a peace either meant to drop. `forced` when `player` was made to declare it, by something it did
//  under a treaty, rather than choosing war; the `DeclaredWar` rules hear which, once the war is declared, and the
//  treaty level it broke (`TreatyLevel`, as it stood before), so a rule set can tell an alliance, a peace, a ceasefire
//  or none apart.
const declareWar = (dependencies, player, other, forced = false) => {
    const broken = (0, treatyLevel_1.treatyLevel)(dependencies, player, other);
    active(dependencies, ShamPeace_1.default, player, other).forEach((sham) => sham.expire(player));
    active(dependencies, Peace_1.default, player, other).forEach((peace) => peace.expire(player));
    active(dependencies, Ceasefire_1.default, player, other).forEach((ceasefire) => ceasefire.expire(player));
    dependencies.interactionRegistry.register(new War_1.default(player, other, new Never_1.default(), dependencies.ruleRegistry));
    dependencies.ruleRegistry.process(DeclaredWar_1.default, player, other, forced, broken);
};
exports.declareWar = declareWar;
// `player` and `other` make peace, unless they have already. Any ceasefire between them ends: the peace supersedes it.
const makePeace = (dependencies, player, other) => {
    active(dependencies, Ceasefire_1.default, player, other).forEach((ceasefire) => ceasefire.expire(player));
    if (active(dependencies, Peace_1.default, player, other).length > 0) {
        return;
    }
    dependencies.interactionRegistry.register(new Peace_1.default(player, other, new Never_1.default(), dependencies.ruleRegistry));
};
exports.makePeace = makePeace;
// Ends any war in force between the two: a ceasefire or an alliance supersedes it, so a pair whose ceasefire lapses is
//  left in contact rather than at war (`treatyLevel`).
const endWar = (dependencies, player, other) => active(dependencies, War_1.default, player, other).forEach((war) => war.expire(player));
// `player` and `other` agree a ceasefire, unless they have one, or a peace, already. Any war between them ends.
const makeCeasefire = (dependencies, player, other) => {
    if (active(dependencies, Peace_1.default, player, other).length > 0 ||
        active(dependencies, Ceasefire_1.default, player, other).length > 0) {
        return;
    }
    endWar(dependencies, player, other);
    dependencies.interactionRegistry.register(new Ceasefire_1.default(player, other, new Never_1.default(), dependencies.ruleRegistry));
};
exports.makeCeasefire = makeCeasefire;
// `player` and `other` become allies, unless they are already. An alliance implies peace, so they make peace first
//  (`makePeace`) and the `Alliance` stands beside that `Peace`: ending the alliance alone leaves them at peace. Any
//  ceasefire or war between them ends.
const makeAlliance = (dependencies, player, other) => {
    if (active(dependencies, Alliance_1.default, player, other).length > 0) {
        return;
    }
    active(dependencies, Ceasefire_1.default, player, other).forEach((ceasefire) => ceasefire.expire(player));
    endWar(dependencies, player, other);
    (0, exports.makePeace)(dependencies, player, other);
    dependencies.interactionRegistry.register(new Alliance_1.default(player, other, new Never_1.default(), dependencies.ruleRegistry));
};
exports.makeAlliance = makeAlliance;
// `player` ends its alliance with `other`. They stay at peace: a `Peace` is made if the alliance stood alone.
const cancelAlliance = (dependencies, player, other) => {
    const alliances = active(dependencies, Alliance_1.default, player, other);
    // No alliance, nothing to cancel: no peace is made either.
    if (alliances.length === 0) {
        return;
    }
    alliances.forEach((alliance) => alliance.expire(player));
    (0, exports.makePeace)(dependencies, player, other);
};
exports.cancelAlliance = cancelAlliance;
exports.activeDeclarations = active;
exports.default = exports.declareWar;
//# sourceMappingURL=declareWar.js.map