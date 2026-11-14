import {
  MeetingStepNumbers,
  MeetingStepRules,
  meetingSteps,
} from '../meetingSteps';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceTaken from '../../Dialogues/AdvanceTaken';
import Criterion from '@civ-clone/core-rule/Criterion';
import Dependencies from '../Dependencies';
import Effect from '@civ-clone/core-rule/Effect';
import { IAction } from '@civ-clone/core-diplomacy/Negotiation/Action';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';
import Step from '@civ-clone/core-diplomacy/Rules/Negotiation/Step';
import { takenBy } from '../exchanged';

/**
 * The meeting's `Step` rules, one for each of `meetingSteps`' rows, in order: each applies while its row does and has
 *  something to say. The ruleset gives the meeting and whether a government answers to a senate; the advance a computer
 *  player took in an exchange is said with `AdvanceTaken`.
 */
export const stepRules = (
  dependencies: Dependencies,
  rules: Pick<MeetingStepRules, 'meeting' | 'hasSenate'>,
  numbers: MeetingStepNumbers
): Step[] =>
  meetingSteps(
    dependencies,
    {
      meeting: rules.meeting,
      hasSenate: rules.hasSenate,
      advanceTaken: (
        player: Player,
        advance: typeof Advance,
        negotiation: Negotiation
      ): IAction =>
        new AdvanceTaken(
          player,
          advance,
          negotiation,
          dependencies.ruleRegistry
        ),
      takenBy,
    },
    numbers
  ).map(
    ([applies, next]) =>
      new Step(
        new Criterion(
          (negotiation: Negotiation): boolean =>
            applies(negotiation) && next(negotiation) !== null
        ),
        new Effect((negotiation: Negotiation): IAction => next(negotiation)!)
      )
  );

export default stepRules;
