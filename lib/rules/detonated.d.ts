import Dependencies from '../Dependencies';
import Detonated from '@civ-clone/base-unit-action-nuclear-attack/Rules/Detonated';
/**
 * `<prefix>:unit/detonated/vendetta`: everyone with a unit or a city under a nuclear strike holds it against the player
 *  who launched it, early, while the victims are still there to be found.
 */
export declare const detonatedRules: (
  prefix: string,
  dependencies: Dependencies
) => Detonated[];
export default detonatedRules;
