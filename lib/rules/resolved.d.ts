import Advance from '@civ-clone/core-science/Advance';
import Dependencies from '../Dependencies';
import Resolved from '@civ-clone/core-diplomacy/Rules/Proposal/Resolved';
declare global {
  interface ChoiceMetaDataMap {
    'diplomacy.exchange-knowledge': typeof Advance;
  }
}
/**
 * What each answer in a meeting does (`stepRules`):
 *
 * - `<prefix>:proposal/resolved/peace`: peace accepted, with the gifts that came with it;
 * - `<prefix>:proposal/resolved/tribute`: tribute paid;
 * - `<prefix>:proposal/resolved/cancel-treaty`: the other player cancels its treaty with the computer player's enemy,
 *   who won't forget it; with chance `waiveTribute` the computer player then waives its tribute;
 * - `<prefix>:proposal/resolved/exchange-knowledge`: each side picks an advance the other has;
 * - `<prefix>:proposal/resolved/declare-war`: war declared;
 * - `<prefix>:proposal/resolved/computer-peace`: two computer players make peace, each giving the other an advance
 *   first if both have one to give.
 */
export declare const resolvedRules: (
  prefix: string,
  dependencies: Dependencies,
  random: () => number,
  waiveTribute: number
) => Resolved[];
export default resolvedRules;
