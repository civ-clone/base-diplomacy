import Advance from '@civ-clone/core-science/Advance';
import Dependencies from './Dependencies';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import Player from '@civ-clone/core-player/Player';
export declare const advancesLacked: (
  dependencies: Dependencies,
  from: Player,
  by: Player
) => Advance[];
export declare const give: (
  dependencies: Dependencies,
  gift: Advance | Gold,
  from: Player,
  to: Player
) => void;
