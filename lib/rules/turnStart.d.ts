import Dependencies from '../Dependencies';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
/**
 * `<prefix>:player/turn-start/drop-sham-peace`: a computer player keeping a peace it means to break drops it, without a
 *  word, with chance `chance` each turn (`dropShamPeace`).
 */
export declare const turnStartRules: (
  prefix: string,
  dependencies: Dependencies,
  random: () => number,
  chance: number
) => TurnStart[];
export default turnStartRules;
