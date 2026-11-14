import Dependencies from '../Dependencies';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
import dropShamPeace from '../shamPeace';

/**
 * `<prefix>:player/turn-start/drop-sham-peace`: a computer player keeping a peace it means to break drops it, without a
 *  word, with chance `chance` each turn (`dropShamPeace`).
 */
export const turnStartRules = (
  prefix: string,
  dependencies: Dependencies,
  random: () => number,
  chance: number
): TurnStart[] => [
  new TurnStart(
    `${prefix}:player/turn-start/drop-sham-peace`,
    new Effect((player: Player): void =>
      dropShamPeace(dependencies, player, random, chance)
    )
  ),
];

export default turnStartRules;
