import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Turn from '@civ-clone/core-turn-based-game/Turn';
export interface Patience {
  spent(): number;
  spend(amount?: number): number;
  reset(): void;
}
/**
 * `holder`'s patience with `toward`: how much of it they've used up, in one direction, kept between meetings and saved
 *  (`PatienceRecord`). How much there is to spend, and what spends it, is the rule set's. Nothing is written until
 *  some is spent, so a rule set that never calls this saves nothing.
 */
export declare const patience: (
  {
    interactionRegistry,
    ruleRegistry,
    turn,
  }: {
    interactionRegistry: InteractionRegistry;
    ruleRegistry?: RuleRegistry | undefined;
    turn?: Turn | undefined;
  },
  holder: Player,
  toward: Player
) => Patience;
export default patience;
