import {
  IRelationRecord,
  RelationRecord,
} from '@civ-clone/core-diplomacy/Records/RelationRecord';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Turn from '@civ-clone/core-turn-based-game/Turn';

export interface ILastContactRecord extends IRelationRecord {
  setLastContact(turn: number): void;
  value(): number;
}

/**
 * The turn two players were last in contact, the same both ways, kept in the `InteractionRegistry` so it's saved. Made
 *  the first time one is recorded (`recordContact`), so a game that never records one has none.
 */
export class LastContactRecord
  extends RelationRecord
  implements ILastContactRecord
{
  private _lastContact: number;

  constructor(
    player: Player,
    other: Player,
    lastContact: number,
    ...args: (RuleRegistry | Turn)[]
  ) {
    super(player, other, ...args);

    this._lastContact = lastContact;

    this.addKey('value');
  }

  setLastContact(turn: number): void {
    this._lastContact = turn;
  }

  value(): number {
    return this._lastContact;
  }
}

export default LastContactRecord;
