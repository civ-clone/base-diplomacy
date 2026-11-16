"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spendPatienceRules = exports.personMeetingSteps = exports.patienceEnds = exports.computerAnswer = exports.proposalMenu = exports.audience = exports.proposalAvailable = exports.sides = exports.personLed = void 0;
const Proposal_1 = require("@civ-clone/core-diplomacy/Negotiation/Proposal");
const Accept_1 = require("@civ-clone/core-diplomacy/Proposal/Accept");
const Decline_1 = require("@civ-clone/core-diplomacy/Proposal/Decline");
const Initiate_1 = require("@civ-clone/core-diplomacy/Negotiation/Initiate");
const Interaction_1 = require("@civ-clone/core-diplomacy/Rules/Negotiation/Interaction");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const ProposalAvailable_1 = require("../Rules/ProposalAvailable");
const Resolution_1 = require("@civ-clone/core-diplomacy/Proposal/Resolution");
const Terminate_1 = require("@civ-clone/core-diplomacy/Negotiation/Terminate");
const patience_1 = require("./patience");
const personLed_1 = require("./personLed");
Object.defineProperty(exports, "personLed", { enumerable: true, get: function () { return personLed_1.personLed; } });
Object.defineProperty(exports, "sides", { enumerable: true, get: function () { return personLed_1.sides; } });
// Whether `proposal` may be offered: at least one `ProposalAvailable` rule answers, and every answer is `true`.
const proposalAvailable = ({ ruleRegistry }, proposal) => {
    const answers = ruleRegistry.process(ProposalAvailable_1.default, proposal);
    return answers.length > 0 && answers.every((answer) => answer);
};
exports.proposalAvailable = proposalAvailable;
const last = (negotiation) => negotiation.lastInteraction();
// The computer player's answer to the person's proposal, made last: what the menu offers again after.
const answeredByComputer = (negotiation) => {
    const action = last(negotiation), { person, computer } = (0, personLed_1.sides)(negotiation);
    return (action instanceof Resolution_1.default &&
        action.by() === computer &&
        action.proposal().by() === person &&
        !(action.proposal() instanceof Initiate_1.default));
};
// Whether the computer player still has the patience to hear another proposal.
const patient = (dependencies, rules, negotiation) => {
    const { person, computer } = (0, personLed_1.sides)(negotiation);
    return ((0, patience_1.default)(dependencies, computer, person).spent() <
        rules.patienceLimit(negotiation));
};
/**
 * The opening: the person asks for an audience (`Initiate`), and the computer player receives them or not
 *  (`rules.answer`). Turned away, the computer player ends the meeting.
 */
const audience = (dependencies, rules) => {
    const { ruleRegistry } = dependencies, led = (negotiation) => (0, personLed_1.personLed)(rules.isHuman, negotiation);
    return [
        [
            (negotiation) => led(negotiation) && last(negotiation) === null,
            (negotiation) => new Initiate_1.default(negotiation.initiator(), negotiation, ruleRegistry),
        ],
        [
            (negotiation) => led(negotiation) &&
                last(negotiation) instanceof Initiate_1.default &&
                last(negotiation).by() === negotiation.initiator(),
            (negotiation) => {
                const initiate = last(negotiation), { computer } = (0, personLed_1.sides)(negotiation);
                return rules.answer(initiate, negotiation)
                    ? new Accept_1.default(computer, initiate, ruleRegistry)
                    : new Decline_1.default(computer, initiate, ruleRegistry);
            },
        ],
        [
            (negotiation) => {
                const action = last(negotiation);
                return (led(negotiation) &&
                    action instanceof Decline_1.default &&
                    action.proposal() instanceof Initiate_1.default);
            },
            (negotiation) => new Terminate_1.default((0, personLed_1.sides)(negotiation).computer, negotiation, ruleRegistry),
        ],
    ];
};
exports.audience = audience;
/**
 * The menu: once the person is received, and again after each answer while the computer player's patience lasts,
 *  every proposal of `rules.proposals` the `ProposalAvailable` rules allow, one row each, in order, then leaving
 *  (`Terminate` by the person).
 */
const proposalMenu = (dependencies, rules) => {
    const { ruleRegistry } = dependencies, open = (negotiation) => {
        if (!(0, personLed_1.personLed)(rules.isHuman, negotiation)) {
            return false;
        }
        const action = last(negotiation);
        if (action instanceof Accept_1.default && action.proposal() instanceof Initiate_1.default) {
            return true;
        }
        return (answeredByComputer(negotiation) &&
            patient(dependencies, rules, negotiation));
    };
    return [
        ...rules.proposals.map((make) => [
            open,
            (negotiation) => {
                const { person, computer } = (0, personLed_1.sides)(negotiation), proposal = make(negotiation, person, computer);
                return proposal !== null && (0, exports.proposalAvailable)(dependencies, proposal)
                    ? proposal
                    : null;
            },
        ]),
        [
            open,
            (negotiation) => new Terminate_1.default(negotiation.initiator(), negotiation, ruleRegistry),
        ],
    ];
};
exports.proposalMenu = proposalMenu;
/**
 * The computer player's answer to each of the person's proposals, from `rules.answer`: the one step on offer, as an
 *  `Accept` or a `Decline` by the computer player.
 */
const computerAnswer = (dependencies, rules) => {
    const { ruleRegistry } = dependencies;
    return [
        [
            (negotiation) => {
                const action = last(negotiation);
                return ((0, personLed_1.personLed)(rules.isHuman, negotiation) &&
                    action instanceof Proposal_1.default &&
                    !(action instanceof Initiate_1.default) &&
                    action.by() === negotiation.initiator() &&
                    !action.resolved());
            },
            (negotiation) => {
                const proposal = last(negotiation), { computer } = (0, personLed_1.sides)(negotiation);
                return rules.answer(proposal, negotiation)
                    ? new Accept_1.default(computer, proposal, ruleRegistry)
                    : new Decline_1.default(computer, proposal, ruleRegistry);
            },
        ],
    ];
};
exports.computerAnswer = computerAnswer;
/**
 * Proposing again: after each answer the menu is offered again (`proposalMenu`) until the computer player's patience
 *  runs out, and then it ends the meeting.
 */
const patienceEnds = (dependencies, rules) => [
    [
        (negotiation) => (0, personLed_1.personLed)(rules.isHuman, negotiation) &&
            answeredByComputer(negotiation) &&
            !patient(dependencies, rules, negotiation),
        (negotiation) => new Terminate_1.default((0, personLed_1.sides)(negotiation).computer, negotiation, dependencies.ruleRegistry),
    ],
];
exports.patienceEnds = patienceEnds;
/**
 * Every piece, in order: the audience, the menu, the computer player's answers, and the end when its patience runs
 *  out.
 */
const personMeetingSteps = (dependencies, rules) => [
    ...(0, exports.audience)(dependencies, rules),
    ...(0, exports.proposalMenu)(dependencies, rules),
    ...(0, exports.computerAnswer)(dependencies, rules),
    ...(0, exports.patienceEnds)(dependencies, rules),
];
exports.personMeetingSteps = personMeetingSteps;
/**
 * An `Interaction` rule that spends the computer player's patience with the person as each of the person's proposals is
 *  made (not the request for an audience): `cost(proposal, spent)` of it, 1 unless the ruleset says otherwise. A cost
 *  below 0 gives some back.
 */
const spendPatienceRules = (prefix, dependencies, rules) => [
    new Interaction_1.default(`${prefix}:negotiation/interaction/spend-patience`, new Criterion_1.default((interaction, negotiation) => (0, personLed_1.personLed)(rules.isHuman, negotiation) &&
        interaction instanceof Proposal_1.default &&
        !(interaction instanceof Initiate_1.default) &&
        interaction.by() === negotiation.initiator()), new Effect_1.default((interaction, negotiation) => {
        var _a;
        const { person, computer } = (0, personLed_1.sides)(negotiation), computerPatience = (0, patience_1.default)(dependencies, computer, person), cost = (_a = rules.cost) !== null && _a !== void 0 ? _a : (() => 1);
        computerPatience.spend(cost(interaction, computerPatience.spent()));
    })),
];
exports.spendPatienceRules = spendPatienceRules;
exports.default = exports.personMeetingSteps;
//# sourceMappingURL=personMeeting.js.map