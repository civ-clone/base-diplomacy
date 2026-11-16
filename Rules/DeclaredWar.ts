import Player from '@civ-clone/core-player/Player';
import { TreatyLevel } from '../lib/treatyLevel';
import Rule from '@civ-clone/core-rule/Rule';

/**
 * `by` has declared war on `against` (`declareWar`). `forced` when it was made to: by something it did under a
 *  treaty (an attack, an incident) rather than by choosing war, so that a rule set can count it against its
 *  reputation either way. `broken` is the treaty level between them just before (`TreatyLevel`: an alliance, a peace,
 *  a ceasefire, or none). Processed once the war is declared; with no rule registered, nothing more happens.
 */
export class DeclaredWar extends Rule<
  [by: Player, against: Player, forced: boolean, broken: TreatyLevel],
  void
> {}

export default DeclaredWar;
