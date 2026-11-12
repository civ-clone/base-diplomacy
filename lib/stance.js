"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stance = void 0;
const standing_1 = require("./standing");
const holds_1 = require("@civ-clone/library-diplomacy/lib/holds");
const isPacified_1 = require("@civ-clone/library-diplomacy/lib/isPacified");
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
// Integer division towards zero.
const div = (value, by) => Math.trunc(value / by);
// `random` is asked for the one coin tossed (whether a computer player that wants peace waives the tribute); without
//  it, nothing random happens and the tribute stands, so the result can be asked for at any time.
// `changeGovernment` is the other side effect: a hostile player whose government answers to a senate, and that can't
//  win it over, changes government. It is called only when the meeting itself asks.
const stance = (dependencies, readers, numbers, player, other, random = null, changeGovernment = null) => {
    const level = readers.level(), presences = (0, standing_1.presence)(dependencies, player, other), ours = presences.get(player), theirs = presences.get(other), ourCities = (0, standing_1.cityCount)(dependencies, player), ourPower = (0, standing_1.power)(dependencies, player), theirPower = (0, standing_1.power)(dependencies, other), ourNukes = readers.nuclear(player), theirNukes = readers.nuclear(other), vendetta = (0, holds_1.hasVendetta)(player, other, dependencies.interactionRegistry), peace = (0, standing_1.atPeace)(dependencies, player, other);
    let fear = 0, tribute = 0, hostile = false, mode = 1, sham = false;
    // 1. Each land mass. Where `player` has cities (more than one, if it has more than one in all) and `other`'s attack
    //  there is greater than its defence, it fears for them. Elsewhere, both having units there makes it hostile, and
    //  what it could take from `other` there adds to the tribute.
    (0, standing_1.landMassesOf)(ours, theirs).forEach((landMass) => {
        const us = (0, standing_1.presenceOn)(ours, landMass), them = (0, standing_1.presenceOn)(theirs, landMass);
        if (us.cities > (ourCities > 1 ? 1 : 0) && them.attack > us.defence) {
            fear += div(them.attack * numbers.fearWeight(level), us.defence + 1);
            return;
        }
        if (them.defence !== 0 && us.defence !== 0) {
            hostile = true;
        }
        if (them.cities !== 0) {
            tribute += us.cities > 1 ? us.attack - them.attack : us.attack;
            return;
        }
        tribute +=
            us.cities !== 0
                ? div(us.defence - them.attack, 2)
                : div(us.attack - them.attack, 4);
    });
    // 2. An ultimatum to the world's leader: late in the game, the highest-ranked civilization with enough cities and no
    //  nuclear weapons is threatened by every computer player with more than one city. A grudge does the same, while
    //  `player` is a third as strong as `other` or more.
    const ultimatum = (0, standing_1.rankedFirst)(dependencies, other) &&
        (0, standing_1.cityCount)(dependencies, other) > numbers.ultimatumCities &&
        ourCities > 1 &&
        theirNukes === 0 &&
        dependencies.turn.value() > numbers.ultimatumTurn;
    if ((ultimatum || (vendetta && 3 * ourPower > theirPower)) &&
        theirNukes === 0) {
        hostile = true;
        tribute = clamp(tribute, 10 * (0, standing_1.rankFromTop)(dependencies, player, numbers.topRanking), 9999);
        fear = 0;
    }
    // 3. Nuclear weapons.
    if (ourNukes > 0 && theirNukes === 0) {
        hostile = true;
        tribute = clamp(tribute, numbers.nuclearTribute, 9999);
    }
    if (theirNukes > 0) {
        if (ourNukes === 0) {
            fear = numbers.nuclearFear;
        }
        else {
            tribute = div(ourNukes * div(tribute, 2), theirNukes);
        }
    }
    if (fear !== 0) {
        hostile = false;
        mode = 0;
    }
    // 4. No threats against a player the `Pacified` rules protect.
    let threatened = ultimatum;
    if ((0, isPacified_1.default)(player, other, dependencies.ruleRegistry)) {
        threatened = false;
        hostile = false;
    }
    // 5. How much to ask: double for a grudge, then scaled by the level, in `tributeUnit`s. It's cut to what `other` has
    //  if that's more than half the ask, and there is no ask at all if `other` couldn't pay.
    if (vendetta) {
        tribute *= 2;
    }
    tribute =
        clamp(div(tribute * (level + 1), numbers.tributeDivisor), 0, numbers.tributeUnits) * numbers.tributeUnit;
    const theirGold = (0, standing_1.gold)(dependencies, other);
    if (tribute > theirGold &&
        tribute <= 2 * theirGold &&
        theirGold >= numbers.tributeUnit) {
        tribute = div(theirGold, numbers.tributeUnit) * numbers.tributeUnit;
    }
    // 6. Nothing to gain, or `other` is more than three times as strong.
    if (tribute === 0 || 3 * ourPower < theirPower) {
        hostile = false;
    }
    if (hostile) {
        mode = 2;
    }
    const wasHostile = hostile;
    // 7. A wish for peace: a grudge counts against it. Each enemy at least a quarter as strong as `player` counts for
    //  it, a stronger one twice, and so does a friendly leader; an aggressive one and being the stronger of the two
    //  count against it.
    let peaceWanted = vendetta ? -2 : 0, enemyAtPeaceWithOther = null;
    dependencies.playerRegistry
        .entries()
        .filter((third) => third !== player && third !== other)
        .forEach((third) => {
        if (!(0, standing_1.atWar)(dependencies, player, third)) {
            return;
        }
        const theirsToo = (0, standing_1.power)(dependencies, third);
        if (ourPower < 4 * theirsToo) {
            peaceWanted++;
        }
        if (theirsToo > ourPower) {
            peaceWanted++;
        }
        if ((0, standing_1.atPeace)(dependencies, other, third)) {
            enemyAtPeaceWithOther = third;
        }
    });
    peaceWanted -= readers.mood(player);
    if (theirPower < ourPower) {
        peaceWanted--;
    }
    if (peaceWanted > (peace ? 0 : 1) && !threatened) {
        hostile = false;
        if (random !== null && random() < 0.5) {
            tribute = 0;
        }
    }
    // 8. Its senate: a hostile player whose government answers to one, without a grudge, backs down if `other` is at
    //  least two-thirds as strong; otherwise it gives up its government, and stays hostile.
    if (hostile && !vendetta && readers.hasSenate(player)) {
        if (3 * theirPower > 2 * ourPower && !threatened) {
            hostile = false;
        }
        else if (changeGovernment !== null) {
            changeGovernment(player);
        }
    }
    // 9. Hostile to a treaty partner: if `player` is the weaker, or holds a grudge, it keeps the peace for now, but
    //  means to drop it.
    if (peace && hostile && (ourPower < theirPower || vendetta)) {
        hostile = false;
        sham = true;
        mode = 0;
    }
    return {
        atPeace: peace,
        enemyAtPeaceWithOther,
        fear,
        hostile,
        mode,
        sham,
        tribute,
        ultimatum: threatened,
        wasHostile,
    };
};
exports.stance = stance;
exports.default = exports.stance;
//# sourceMappingURL=stance.js.map