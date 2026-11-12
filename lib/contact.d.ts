import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
export interface ContactOnMove {
  canMakeContact: (unit: Unit) => boolean;
  besideAnother: (unit: Unit) => boolean;
  makeContact: (unit: Unit) => void;
}
export declare const contactOnMove: (
  interactionRegistry: InteractionRegistry,
  unitRegistry: UnitRegistry
) => ContactOnMove;
export default contactOnMove;
