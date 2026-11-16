import {
  IRelationRecord,
  RelationRecord,
} from '@civ-clone/core-diplomacy/Records/RelationRecord';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Turn from '@civ-clone/core-turn-based-game/Turn';

export interface IPatienceRecord extends IRelationRecord {
  holder(): Player;
  setSpent(spent: number): void;
  toward(): Player;
  value(): number;
}

/**
 * How much of `holder`'s patience with `toward` is spent: one direction of one pair, kept in the `InteractionRegistry`
 *  so it's saved. Made the first time any is spent (`patience`), so a game that never spends any has none.
 */
export class PatienceRecord extends RelationRecord implements IPatienceRecord {
  private _holder: Player;
  private _spent: number;
  private _toward: Player;

  constructor(
    holder: Player,
    toward: Player,
    spent: number,
    ...args: (RuleRegistry | Turn)[]
  ) {
    super(holder, toward, ...args);

    this._holder = holder;
    this._spent = spent;
    this._toward = toward;

    this.addKey('holder', 'toward', 'value');
  }

  holder(): Player {
    return this._holder;
  }

  setSpent(spent: number): void {
    this._spent = spent;
  }

  toward(): Player {
    return this._toward;
  }

  value(): number {
    return this._spent;
  }
}

export default PatienceRecord;
