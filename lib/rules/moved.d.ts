import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
/** A `Moved` rule making contact between players whose units meet (`contactOnMove`); the barbarians meet no one. */
export declare const movedRules: (
  interactionRegistry: InteractionRegistry,
  unitRegistry: UnitRegistry
) => Moved[];
export default movedRules;
