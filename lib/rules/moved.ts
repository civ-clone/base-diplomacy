import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import contactOnMove from '../contact';

/** A `Moved` rule making contact between players whose units meet (`contactOnMove`); the barbarians meet no one. */
export const movedRules = (
  interactionRegistry: InteractionRegistry,
  unitRegistry: UnitRegistry
): Moved[] => {
  const { canMakeContact, besideAnother, makeContact } = contactOnMove(
    interactionRegistry,
    unitRegistry
  );

  return [
    new Moved(
      new Criterion(canMakeContact),
      new Criterion(besideAnother),
      new Effect(makeContact)
    ),
  ];
};

export default movedRules;
