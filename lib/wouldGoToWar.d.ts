import Dependencies from './Dependencies';
import Player from '@civ-clone/core-player/Player';
import Readers from './Readers';
export declare const wouldGoToWar: (
  dependencies: Dependencies,
  readers: Readers,
  threshold: number,
  player: Player,
  other: Player
) => boolean;
export default wouldGoToWar;
