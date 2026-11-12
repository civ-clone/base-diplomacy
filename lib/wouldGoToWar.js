"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wouldGoToWar = void 0;
const standing_1 = require("./standing");
const div = (value, by) => Math.trunc(value / by);
// Whether computer player `player` would go to war with computer player `other` when they meet. Two computer players
//  don't parley as a computer player and a person do; the game decides it. `player` holds back:
// - while it is at war with a person's player and `other` is weaker than that player, or the other way round (it
//  won't weaken a fellow enemy of a person);
// - while `other` has more nuclear weapons;
// - where it has cities that couldn't stand up to `other`'s attack there.
// Otherwise it fights if its attack, where both have units, outweighs `other`'s defence and half its attack there by
//  enough: four times the ratio must reach `threshold`, plus one for each war it already has, one for a treaty it
//  would break, and its leader's mood taken off. And it fights anyway if it has no cities where they both have units.
const wouldGoToWar = (dependencies, readers, threshold, player, other) => {
    const humans = dependencies.playerRegistry
        .entries()
        .filter((human) => readers.isHuman(human));
    if (humans.some((human) => ((0, standing_1.atWar)(dependencies, player, human) &&
        (0, standing_1.power)(dependencies, other) < (0, standing_1.power)(dependencies, human)) ||
        ((0, standing_1.atWar)(dependencies, other, human) &&
            (0, standing_1.power)(dependencies, player) < (0, standing_1.power)(dependencies, human)))) {
        return false;
    }
    if (readers.nuclear(player) < readers.nuclear(other)) {
        return false;
    }
    const wars = dependencies.playerRegistry
        .entries()
        .filter((third) => third !== other && (0, standing_1.atWar)(dependencies, player, third)).length, reluctance = wars +
        ((0, standing_1.atPeace)(dependencies, player, other) ? 1 : 0) -
        readers.mood(player), presences = (0, standing_1.presence)(dependencies, player, other), ours = presences.get(player), theirs = presences.get(other);
    let ourAttack = 0, theirStrength = 1, citiesContested = 0;
    for (const landMass of (0, standing_1.landMassesOf)(ours, theirs)) {
        const us = (0, standing_1.presenceOn)(ours, landMass), them = (0, standing_1.presenceOn)(theirs, landMass);
        if (us.cities !== 0 && div(us.attack, 2) + us.defence < them.attack) {
            return false;
        }
        if (us.attack !== 0 && them.defence !== 0) {
            ourAttack += us.attack;
            theirStrength += div(them.attack, 2) + them.defence;
            citiesContested += us.cities;
        }
    }
    if (div(ourAttack * 4, theirStrength) >= reluctance + threshold) {
        return true;
    }
    return citiesContested === 0;
};
exports.wouldGoToWar = wouldGoToWar;
exports.default = exports.wouldGoToWar;
//# sourceMappingURL=wouldGoToWar.js.map