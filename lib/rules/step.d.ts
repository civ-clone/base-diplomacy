import { MeetingStepNumbers, MeetingStepRules } from '../meetingSteps';
import Dependencies from '../Dependencies';
import Step from '@civ-clone/core-diplomacy/Rules/Negotiation/Step';
/**
 * The meeting's `Step` rules, one for each of `meetingSteps`' rows, in order: each applies while its row does and has
 *  something to say. The ruleset gives the meeting and whether a government answers to a senate; the advance a computer
 *  player took in an exchange is said with `AdvanceTaken`.
 */
export declare const stepRules: (
  dependencies: Dependencies,
  rules: Pick<MeetingStepRules, 'meeting' | 'hasSenate'>,
  numbers: MeetingStepNumbers
) => Step[];
export default stepRules;
