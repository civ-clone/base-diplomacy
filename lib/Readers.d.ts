import Player from '@civ-clone/core-player/Player';
export interface Readers {
  isHuman: (player: Player) => boolean;
  nuclear: (player: Player) => number;
  mood: (player: Player) => number;
  hasSenate: (player: Player) => boolean;
  level: () => number;
}
export default Readers;
