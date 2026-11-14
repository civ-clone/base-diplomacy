import Dependencies from '../Dependencies';
import Interaction from '@civ-clone/core-diplomacy/Rules/Negotiation/Interaction';
/**
 * A negotiation's interactions:
 *
 * - `<prefix>:negotiation/interaction/register`: each is registered;
 * - `<prefix>:negotiation/interaction/sham-peace`: a computer player that backed off from a treaty partner it wanted to
 *   threaten keeps the peace for now, and means to drop it (a `ShamPeace`, which `turnStartRules` acts on).
 */
export declare const interactionRules: (
  prefix: string,
  dependencies: Dependencies
) => Interaction[];
export default interactionRules;
