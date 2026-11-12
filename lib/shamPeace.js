"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropShamPeace = void 0;
const Peace_1 = require("@civ-clone/base-diplomacy-declaration-peace/Peace");
const ShamPeace_1 = require("@civ-clone/library-diplomacy/Declarations/ShamPeace");
const declareWar_1 = require("./declareWar");
// A computer player keeping a peace it means to break drops it, without a word, with chance `chance` each time it's
//  asked (`random` is only asked while the treaty stands). The treaty goes first, while the sham still marks it as one
//  to end quietly.
const dropShamPeace = (dependencies, player, random, chance) => dependencies.interactionRegistry
    .getByPlayer(player)
    .filter((interaction) => interaction instanceof ShamPeace_1.default &&
    interaction.active() &&
    interaction.holder() === player)
    .forEach((sham) => {
    const treaties = (0, declareWar_1.activeDeclarations)(dependencies, Peace_1.default, sham.holder(), sham.against());
    if (treaties.length > 0 && random() >= chance) {
        return;
    }
    treaties.forEach((peace) => peace.expire(sham.holder()));
    sham.expire(sham.holder());
});
exports.dropShamPeace = dropShamPeace;
exports.default = exports.dropShamPeace;
//# sourceMappingURL=shamPeace.js.map