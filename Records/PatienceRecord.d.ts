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
export declare class PatienceRecord
  extends RelationRecord
  implements IPatienceRecord
{
  private _holder;
  private _spent;
  private _toward;
  constructor(
    holder: Player,
    toward: Player,
    spent: number,
    ...args: (RuleRegistry | Turn)[]
  );
  holder(): Player;
  setSpent(spent: number): void;
  toward(): Player;
  value(): number;
}
export default PatienceRecord;
