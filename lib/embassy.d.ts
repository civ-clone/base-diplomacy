import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
/**
 * Whether `player` has an embassy with `other`: an `Embassy` it holds there, or, failing that, any `HasEmbassy` rule
 *  answering `true` (a wonder that acts as an embassy with everyone, say). One way, as an `Embassy` is. With no
 *  `ruleRegistry`, or no `HasEmbassy` rule, only an `Embassy` counts.
 */
export declare const hasEmbassy: (
  {
    interactionRegistry,
    ruleRegistry,
  }: {
    interactionRegistry: InteractionRegistry;
    ruleRegistry?: RuleRegistry | undefined;
  },
  player: Player,
  other: Player
) => boolean;
export default hasEmbassy;
