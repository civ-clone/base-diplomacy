import Dependencies from '../Dependencies';
import Effect from '@civ-clone/core-rule/Effect';
import { IInteraction } from '@civ-clone/core-diplomacy/Interaction';
import Interaction from '@civ-clone/core-diplomacy/Rules/Negotiation/Interaction';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Never from '@civ-clone/core-diplomacy/Expiries/Never';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import ShamPeace from '@civ-clone/library-diplomacy/Declarations/ShamPeace';
import Terminate from '@civ-clone/core-diplomacy/Negotiation/Terminate';
import { activeDeclarations } from '../declareWar';
import { heldBy } from '@civ-clone/library-diplomacy/lib/holds';
import { knownMeeting } from '../meeting';

/**
 * A negotiation's interactions:
 *
 * - `<prefix>:negotiation/interaction/register`: each is registered;
 * - `<prefix>:negotiation/interaction/sham-peace`: a computer player that backed off from a treaty partner it wanted to
 *   threaten keeps the peace for now, and means to drop it (a `ShamPeace`, which `turnStartRules` acts on).
 */
export const interactionRules = (
  prefix: string,
  dependencies: Dependencies
): Interaction[] => [
  new Interaction(
    `${prefix}:negotiation/interaction/register`,
    new Effect((interaction: IInteraction): void =>
      dependencies.interactionRegistry.register(interaction)
    )
  ),

  new Interaction(
    `${prefix}:negotiation/interaction/sham-peace`,
    new Effect((interaction: IInteraction, negotiation: Negotiation): void => {
      const meeting = knownMeeting(negotiation);

      if (
        !(interaction instanceof Terminate) ||
        meeting === null ||
        !meeting.stance.sham ||
        activeDeclarations(dependencies, Peace, meeting.player, meeting.other)
          .length === 0 ||
        heldBy(
          ShamPeace,
          meeting.player,
          meeting.other,
          dependencies.interactionRegistry
        ) !== null
      ) {
        return;
      }

      dependencies.interactionRegistry.register(
        new ShamPeace(
          meeting.player,
          meeting.other,
          new Never(),
          dependencies.ruleRegistry
        )
      );
    })
  ),
];

export default interactionRules;
