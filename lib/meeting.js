"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calm = exports.negotiationOf = exports.knownMeeting = exports.meetingFor = void 0;
const Negotiation_1 = require("@civ-clone/core-diplomacy/Negotiation");
const standing_1 = require("./standing");
const isPacified_1 = require("@civ-clone/library-diplomacy/lib/isPacified");
const meetings = new WeakMap();
// The computer pair's decision: war if either would go to war with the other (neither with a player the `Pacified`
//  rules protect, nor one with a senate), otherwise peace. War between two at war already changes nothing; peace
//  between two at peace still trades advances.
const computerDecision = (dependencies, rules, player, other, firstContact) => {
    const wants = (a, b) => rules.wouldGoToWar(a, b) &&
        !(0, isPacified_1.default)(a, b, dependencies.ruleRegistry) &&
        !rules.hasSenate(a);
    if (wants(player, other) || wants(other, player)) {
        return (0, standing_1.atPeace)(dependencies, player, other) || firstContact
            ? 'war'
            : 'nothing';
    }
    return 'peace';
};
// The meeting for `negotiation`, worked out the first time it's asked for: that is when the coin is tossed and a
//  government may change.
const meetingFor = (dependencies, rules, negotiation, random) => {
    const known = meetings.get(negotiation);
    if (known !== undefined) {
        return known;
    }
    const [player, other] = negotiation.players(), firstContact = !dependencies.interactionRegistry
        .getByPlayers(player, other)
        .some((interaction) => interaction instanceof Negotiation_1.default && interaction !== negotiation), computer = !rules.isHuman(player) && !rules.isHuman(other), meeting = {
        player,
        other,
        computer: computer
            ? computerDecision(dependencies, rules, player, other, firstContact)
            : null,
        stance: rules.stance(player, other, random, rules.changeGovernment),
        firstContact,
    };
    meetings.set(negotiation, meeting);
    return meeting;
};
exports.meetingFor = meetingFor;
// The meeting for `negotiation` if it's been worked out, without working it out.
const knownMeeting = (negotiation) => { var _a; return (_a = meetings.get(negotiation)) !== null && _a !== void 0 ? _a : null; };
exports.knownMeeting = knownMeeting;
// The negotiation a proposal was made in.
const negotiationOf = (proposal) => proposal.negotiation();
exports.negotiationOf = negotiationOf;
// Whatever the other player gives the computer player calms it: it's no longer hostile.
const calm = (proposal) => {
    const meeting = (0, exports.knownMeeting)((0, exports.negotiationOf)(proposal));
    if (meeting !== null && proposal.by() === meeting.player) {
        meeting.stance.hostile = false;
    }
};
exports.calm = calm;
exports.default = exports.meetingFor;
//# sourceMappingURL=meeting.js.map