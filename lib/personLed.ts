import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';

// The two sides of a negotiation a person opened: the person, and the computer player they came to.
export const sides = (
  negotiation: Negotiation
): { person: Player; computer: Player } => {
  const person = negotiation.initiator();

  return {
    person,
    computer: negotiation.players().find((player) => player !== person)!,
  };
};

// Whether a person opened `negotiation` to talk to a computer player.
export const personLed = (
  isHuman: (player: Player) => boolean,
  negotiation: Negotiation
): boolean => {
  const { person, computer } = sides(negotiation);

  return isHuman(person) && computer !== undefined && !isHuman(computer);
};

export default personLed;
