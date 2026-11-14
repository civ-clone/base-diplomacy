import Criterion from '@civ-clone/core-rule/Criterion';
import Declaration from '@civ-clone/core-diplomacy/Declaration';
import Effect from '@civ-clone/core-rule/Effect';
import Engine from '@civ-clone/core-engine/Engine';
import Expired from '@civ-clone/core-diplomacy/Rules/Declaration/Expired';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Player from '@civ-clone/core-player/Player';
import ShamPeace from '@civ-clone/library-diplomacy/Declarations/ShamPeace';

/**
 * `<prefix>:declaration/expired/announce`: the engine's listeners hear of a treaty that ended, and who ended it (`by`,
 *  if anyone did: whoever breaks a treaty isn't told they've been attacked). A peace dropped by a player that only
 *  pretended to keep it ends unannounced (`turnStartRules`), as does the pretence itself.
 */
export const expiredRules = (
  prefix: string,
  engine: Engine,
  interactionRegistry: InteractionRegistry
): Expired[] => [
  new Expired(
    `${prefix}:declaration/expired/announce`,
    new Criterion(
      (declaration: Declaration): boolean =>
        !(declaration instanceof ShamPeace) &&
        !(
          declaration instanceof Peace &&
          interactionRegistry
            .getByPlayers(...declaration.players())
            .some(
              (interaction) =>
                interaction instanceof ShamPeace && interaction.active()
            )
        )
    ),
    new Effect((declaration: Declaration, by: Player | null = null) => {
      engine.emit('diplomacy:declaration-expired', declaration, by);

      declaration
        .players()
        .forEach((player) =>
          engine.emit('player:declaration-expired', player, declaration, by)
        );
    })
  ),
];

export default expiredRules;
