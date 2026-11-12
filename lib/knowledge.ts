import Advance from '@civ-clone/core-science/Advance';
import Dependencies from './Dependencies';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import Player from '@civ-clone/core-player/Player';

// The advances `from` knows and `by` doesn't, leaving out repeatable ones.
export const advancesLacked = (
  dependencies: Dependencies,
  from: Player,
  by: Player
): Advance[] => {
  const byResearch = dependencies.playerResearchRegistry.getByPlayer(by);

  return dependencies.playerResearchRegistry
    .getByPlayer(from)
    .complete()
    .filter((advance: Advance): boolean => {
      const AdvanceType = advance.sourceClass<typeof Advance>();

      return !AdvanceType.repeatable && !byResearch.completed(AdvanceType);
    });
};

// `from` gives `to` gold, or an advance.
export const give = (
  dependencies: Dependencies,
  gift: Advance | Gold,
  from: Player,
  to: Player
): void => {
  if (gift instanceof Gold) {
    dependencies.playerTreasuryRegistry
      .getByPlayerAndType(from, Gold)
      .subtract(gift.value());
    dependencies.playerTreasuryRegistry
      .getByPlayerAndType(to, Gold)
      .add(gift.value());

    return;
  }

  dependencies.playerResearchRegistry
    .getByPlayer(to)
    .addAdvance(gift.sourceClass());
};
