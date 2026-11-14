import Engine from '@civ-clone/core-engine/Engine';
import Expired from '@civ-clone/core-diplomacy/Rules/Declaration/Expired';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
/**
 * `<prefix>:declaration/expired/announce`: the engine's listeners hear of a treaty that ended, and who ended it (`by`,
 *  if anyone did: whoever breaks a treaty isn't told they've been attacked). A peace dropped by a player that only
 *  pretended to keep it ends unannounced (`turnStartRules`), as does the pretence itself.
 */
export declare const expiredRules: (
  prefix: string,
  engine: Engine,
  interactionRegistry: InteractionRegistry
) => Expired[];
export default expiredRules;
