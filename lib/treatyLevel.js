"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.treatyName = exports.hasTreatyLevel = exports.treatyLevel = exports.TreatyLevel = void 0;
const Alliance_1 = require("@civ-clone/base-diplomacy-declaration-alliance/Alliance");
const Ceasefire_1 = require("@civ-clone/base-diplomacy-declaration-ceasefire/Ceasefire");
const Peace_1 = require("@civ-clone/base-diplomacy-declaration-peace/Peace");
const War_1 = require("@civ-clone/base-diplomacy-declaration-war/War");
/**
 * How far two players' treaties go, lowest first, so levels compare with `<` and `>=`.
 *
 * - `War`: a `War` is in force and no treaty is.
 * - `Contact`: no treaty and no war in force. Whether they have met at all is `haveMet`'s question, not this one's.
 * - `Ceasefire`, `Peace`, `Alliance`: the highest of those in force. An `Alliance` is a `Peace`, so any treaty it's
 *   in force with is counted as an alliance.
 *
 * Civ1's rules read only "at peace" (`>= TreatyLevel.Peace`), and they treat any two who have met with no peace as at
 *  war whether or not a `War` was declared (`atWar`), so for them `War` and `Contact` mean the same. `makePeace` leaves
 *  an earlier `War` in force, as it always has; `makeCeasefire` and `makeAlliance` end it, so a pair whose ceasefire
 *  lapses is left in contact, not at war, as in Civ2.
 */
var TreatyLevel;
(function (TreatyLevel) {
    TreatyLevel[TreatyLevel["War"] = 0] = "War";
    TreatyLevel[TreatyLevel["Contact"] = 1] = "Contact";
    TreatyLevel[TreatyLevel["Ceasefire"] = 2] = "Ceasefire";
    TreatyLevel[TreatyLevel["Peace"] = 3] = "Peace";
    TreatyLevel[TreatyLevel["Alliance"] = 4] = "Alliance";
})(TreatyLevel = exports.TreatyLevel || (exports.TreatyLevel = {}));
// The highest level in force among `interactions`, looking no further once a treaty of at least `enough` is found.
const levelOf = (interactions, enough) => {
    let level = TreatyLevel.Contact;
    for (let i = 0; i < interactions.length; i++) {
        const interaction = interactions[i];
        if (interaction instanceof Alliance_1.default) {
            if (interaction.active()) {
                return TreatyLevel.Alliance;
            }
        }
        else if (interaction instanceof Peace_1.default) {
            if (level < TreatyLevel.Peace && interaction.active()) {
                level = TreatyLevel.Peace;
            }
        }
        else if (interaction instanceof Ceasefire_1.default) {
            if (level < TreatyLevel.Ceasefire && interaction.active()) {
                level = TreatyLevel.Ceasefire;
            }
        }
        else if (interaction instanceof War_1.default) {
            if (level === TreatyLevel.Contact && interaction.active()) {
                level = TreatyLevel.War;
            }
        }
        // A treaty in force can't be lowered by anything later in the list, but `Contact` can still turn out to be `War`.
        if (level >= enough && level >= TreatyLevel.Ceasefire) {
            return level;
        }
    }
    return level;
};
/**
 * The treaty level between `player` and `other` (`TreatyLevel`), from the declarations in force between them. Route
 *  finding asks about treaties for every step it considers (civ-clone/web-renderer#657), so this looks at the pair's
 *  interactions once and makes nothing.
 */
const treatyLevel = ({ interactionRegistry }, player, other) => levelOf(interactionRegistry.getByPlayers(player, other), TreatyLevel.Alliance);
exports.treatyLevel = treatyLevel;
/**
 * Whether the treaty level between `player` and `other` is `level` or higher: `treatyLevel(...) >= level`, but it
 *  stops looking as soon as it finds a treaty that high. `hasTreatyLevel(dependencies, a, b, TreatyLevel.Peace)` is
 *  "at peace", allies included.
 */
const hasTreatyLevel = ({ interactionRegistry }, player, other, level) => levelOf(interactionRegistry.getByPlayers(player, other), level) >= level;
exports.hasTreatyLevel = hasTreatyLevel;
/**
 * A level's name, `'war'`, `'contact'`, `'ceasefire'`, `'peace'` or `'alliance'`, for wording and messages.
 */
const treatyName = (level) => TreatyLevel[level].toLowerCase();
exports.treatyName = treatyName;
exports.default = exports.treatyLevel;
//# sourceMappingURL=treatyLevel.js.map