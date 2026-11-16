"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personLed = exports.sides = void 0;
// The two sides of a negotiation a person opened: the person, and the computer player they came to.
const sides = (negotiation) => {
    const person = negotiation.initiator();
    return {
        person,
        computer: negotiation.players().find((player) => player !== person),
    };
};
exports.sides = sides;
// Whether a person opened `negotiation` to talk to a computer player.
const personLed = (isHuman, negotiation) => {
    const { person, computer } = (0, exports.sides)(negotiation);
    return isHuman(person) && computer !== undefined && !isHuman(computer);
};
exports.personLed = personLed;
exports.default = exports.personLed;
//# sourceMappingURL=personLed.js.map