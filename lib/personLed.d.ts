import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';
export declare const sides: (negotiation: Negotiation) => {
  person: Player;
  computer: Player;
};
export declare const personLed: (
  isHuman: (player: Player) => boolean,
  negotiation: Negotiation
) => boolean;
export default personLed;
