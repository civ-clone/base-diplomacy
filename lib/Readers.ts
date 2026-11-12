import Player from '@civ-clone/core-player/Player';

// What a ruleset tells the diplomacy arithmetic about its own content: who is a person, which units are nuclear,
//  what its leaders are like, which governments answer to a senate, and how hard the game is.
export interface Readers {
  // Whether a person plays `player` rather than the computer.
  isHuman: (player: Player) => boolean;
  // How many nuclear weapons `player` has.
  nuclear: (player: Player) => number;
  // Its leader's temper: above 0 the more aggressive, below 0 the more friendly.
  mood: (player: Player) => number;
  // Whether `player`'s government answers to a senate, which holds it back from war.
  hasSenate: (player: Player) => boolean;
  // The game's difficulty level, 0 the easiest.
  level: () => number;
}

export default Readers;
