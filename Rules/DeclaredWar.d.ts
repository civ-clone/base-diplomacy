import Player from '@civ-clone/core-player/Player';
import Rule from '@civ-clone/core-rule/Rule';
/**
 * `by` has declared war on `against` (`declareWar`). `forced` when it was made to: by something it did under a
 *  treaty (an attack, an incident) rather than by choosing war, so that a rule set can count it against its
 *  reputation either way. Processed once the war is declared; with no rule registered, nothing more happens.
 */
export declare class DeclaredWar extends Rule<
  [by: Player, against: Player, forced: boolean],
  void
> {}
export default DeclaredWar;
