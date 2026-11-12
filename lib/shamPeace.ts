import Dependencies from './Dependencies';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Player from '@civ-clone/core-player/Player';
import ShamPeace from '@civ-clone/library-diplomacy/Declarations/ShamPeace';
import { activeDeclarations } from './declareWar';

// A computer player keeping a peace it means to break drops it, without a word, with chance `chance` each time it's
//  asked (`random` is only asked while the treaty stands). The treaty goes first, while the sham still marks it as one
//  to end quietly.
export const dropShamPeace = (
  dependencies: Dependencies,
  player: Player,
  random: () => number,
  chance: number
): void =>
  dependencies.interactionRegistry
    .getByPlayer(player)
    .filter(
      (interaction): interaction is ShamPeace =>
        interaction instanceof ShamPeace &&
        interaction.active() &&
        interaction.holder() === player
    )
    .forEach((sham: ShamPeace): void => {
      const treaties = activeDeclarations(
        dependencies,
        Peace,
        sham.holder(),
        sham.against()
      );

      if (treaties.length > 0 && random() >= chance) {
        return;
      }

      treaties.forEach((peace) => peace.expire(sham.holder()));
      sham.expire(sham.holder());
    });

export default dropShamPeace;
