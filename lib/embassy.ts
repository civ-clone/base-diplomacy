import Embassy from '@civ-clone/base-unit-action-establish-embassy/Embassy';
import HasEmbassy from '../Rules/HasEmbassy';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';

/**
 * Whether `player` has an embassy with `other`: an `Embassy` it holds there, or, failing that, any `HasEmbassy` rule
 *  answering `true` (a wonder that acts as an embassy with everyone, say). One way, as an `Embassy` is. With no
 *  `ruleRegistry`, or no `HasEmbassy` rule, only an `Embassy` counts.
 */
export const hasEmbassy = (
  {
    interactionRegistry,
    ruleRegistry,
  }: {
    interactionRegistry: InteractionRegistry;
    ruleRegistry?: RuleRegistry;
  },
  player: Player,
  other: Player
): boolean =>
  interactionRegistry
    .getByPlayers(player, other)
    .some(
      (interaction) =>
        interaction instanceof Embassy &&
        (interaction as unknown as Embassy).holder() === player
    ) ||
  (ruleRegistry !== undefined &&
    ruleRegistry
      .process(HasEmbassy, player, other)
      .some((answer: boolean): boolean => answer));

export default hasEmbassy;
