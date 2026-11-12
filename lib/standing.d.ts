import { IStrength } from '@civ-clone/core-power/Rules/MilitaryStrength';
import Dependencies from './Dependencies';
import Government from '@civ-clone/core-government/Government';
import LandMass from '@civ-clone/core-world/LandMass';
import Player from '@civ-clone/core-player/Player';
import Trait from '@civ-clone/core-civilization/Trait';
import Unit from '@civ-clone/core-unit/Unit';
export interface Presence extends IStrength {
  cities: number;
}
export declare const presence: (
  dependencies: Dependencies,
  ...players: Player[]
) => Map<Player, Map<LandMass, Presence>>;
export declare const landMassesOf: (
  ...presences: Map<LandMass, Presence>[]
) => LandMass[];
export declare const presenceOn: (
  byLandMass: Map<LandMass, Presence>,
  landMass: LandMass
) => Presence;
export declare const power: (
  dependencies: Dependencies,
  player: Player
) => number;
export declare const unitCount: (
  dependencies: Dependencies,
  player: Player,
  matches: (unit: Unit) => boolean
) => number;
export declare const gold: (
  dependencies: Dependencies,
  player: Player
) => number;
export declare const cityCount: (
  dependencies: Dependencies,
  player: Player
) => number;
export declare const atPeace: (
  dependencies: Dependencies,
  player: Player,
  other: Player
) => boolean;
export declare const haveMet: (
  dependencies: Dependencies,
  player: Player,
  other: Player
) => boolean;
export declare const atWar: (
  dependencies: Dependencies,
  player: Player,
  other: Player
) => boolean;
export declare const traitScore: (
  dependencies: Dependencies,
  player: Player,
  score: (trait: Trait) => number
) => number;
export declare const governedBy: (
  dependencies: Dependencies,
  player: Player,
  ...governments: (typeof Government)[]
) => boolean;
export declare const rankFromTop: (
  dependencies: Dependencies,
  player: Player,
  top: number
) => number;
export declare const rankedFirst: (
  dependencies: Dependencies,
  player: Player
) => boolean;
