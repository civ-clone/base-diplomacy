import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import PatienceRecord from '../Records/PatienceRecord';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Turn from '@civ-clone/core-turn-based-game/Turn';

export interface Patience {
  // How much is spent: 0 until any is.
  spent(): number;
  // Spends `amount` (1 unless given; less than 0 gives some back, never below 0), and answers how much is spent.
  spend(amount?: number): number;
  // Nothing spent any more.
  reset(): void;
}

/**
 * `holder`'s patience with `toward`: how much of it they've used up, in one direction, kept between meetings and saved
 *  (`PatienceRecord`). How much there is to spend, and what spends it, is the rule set's. Nothing is written until
 *  some is spent, so a rule set that never calls this saves nothing.
 */
export const patience = (
  {
    interactionRegistry,
    ruleRegistry,
    turn,
  }: {
    interactionRegistry: InteractionRegistry;
    ruleRegistry?: RuleRegistry;
    turn?: Turn;
  },
  holder: Player,
  toward: Player
): Patience => {
  const record = (): PatienceRecord | undefined =>
      interactionRegistry
        .getByPlayers(holder, toward)
        .find(
          (interaction): interaction is PatienceRecord =>
            interaction instanceof PatienceRecord &&
            interaction.holder() === holder &&
            interaction.toward() === toward
        ),
    spent = (): number => record()?.value() ?? 0,
    set = (value: number): void => {
      const existing = record();

      if (existing !== undefined) {
        existing.setSpent(value);

        return;
      }

      if (value === 0) {
        return;
      }

      interactionRegistry.register(
        new PatienceRecord(
          holder,
          toward,
          value,
          ...([ruleRegistry, turn].filter((arg) => arg !== undefined) as (
            | RuleRegistry
            | Turn
          )[])
        )
      );
    };

  return {
    spent,
    spend: (amount: number = 1): number => {
      const value = Math.max(0, spent() + amount);

      set(value);

      return value;
    },
    reset: (): void => set(0),
  };
};

export default patience;
