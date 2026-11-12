import Dependencies from './Dependencies';
import Player from '@civ-clone/core-player/Player';
import Readers from './Readers';
export interface Stance {
  atPeace: boolean;
  fear: number;
  hostile: boolean;
  wasHostile: boolean;
  mode: 0 | 1 | 2;
  sham: boolean;
  tribute: number;
  ultimatum: boolean;
  enemyAtPeaceWithOther: Player | null;
}
export interface StanceNumbers {
  fearWeight: (level: number) => number;
  ultimatumTurn: number;
  ultimatumCities: number;
  topRanking: number;
  nuclearTribute: number;
  nuclearFear: number;
  tributeDivisor: number;
  tributeUnit: number;
  tributeUnits: number;
}
export declare const stance: (
  dependencies: Dependencies,
  readers: Readers,
  numbers: StanceNumbers,
  player: Player,
  other: Player,
  random?: (() => number) | null,
  changeGovernment?: ((player: Player) => void) | null
) => Stance;
export default stance;
