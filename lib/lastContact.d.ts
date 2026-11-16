import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Turn from '@civ-clone/core-turn-based-game/Turn';
type Registries = {
  interactionRegistry: InteractionRegistry;
  ruleRegistry?: RuleRegistry;
  turn?: Turn;
};
/**
 * The turn `player` and `other` were last in contact, as a rule set records it (`recordContact`), or `undefined` if it
 *  never has. The same both ways.
 */
export declare const lastContact: (
  { interactionRegistry }: Registries,
  player: Player,
  other: Player
) => number | undefined;
/**
 * Records that `player` and `other` were in contact on `turn` (`LastContactRecord`, saved). Nothing is written until a
 *  rule set records one.
 */
export declare const recordContact: (
  { interactionRegistry, ruleRegistry, turn: gameTurn }: Registries,
  player: Player,
  other: Player,
  turn: number
) => void;
export default lastContact;
