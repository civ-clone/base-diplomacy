import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import LastContactRecord from '../Records/LastContactRecord';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Turn from '@civ-clone/core-turn-based-game/Turn';

type Registries = {
  interactionRegistry: InteractionRegistry;
  ruleRegistry?: RuleRegistry;
  turn?: Turn;
};

const recordOf = (
  interactionRegistry: InteractionRegistry,
  player: Player,
  other: Player
): LastContactRecord | undefined =>
  interactionRegistry
    .getByPlayers(player, other)
    .find(
      (interaction): interaction is LastContactRecord =>
        interaction instanceof LastContactRecord
    );

/**
 * The turn `player` and `other` were last in contact, as a rule set records it (`recordContact`), or `undefined` if it
 *  never has. The same both ways.
 */
export const lastContact = (
  { interactionRegistry }: Registries,
  player: Player,
  other: Player
): number | undefined => recordOf(interactionRegistry, player, other)?.value();

/**
 * Records that `player` and `other` were in contact on `turn` (`LastContactRecord`, saved). Nothing is written until a
 *  rule set records one.
 */
export const recordContact = (
  { interactionRegistry, ruleRegistry, turn: gameTurn }: Registries,
  player: Player,
  other: Player,
  turn: number
): void => {
  const existing = recordOf(interactionRegistry, player, other);

  if (existing !== undefined) {
    existing.setLastContact(turn);

    return;
  }

  interactionRegistry.register(
    new LastContactRecord(
      player,
      other,
      turn,
      ...([ruleRegistry, gameTurn].filter((arg) => arg !== undefined) as (
        | RuleRegistry
        | Turn
      )[])
    )
  );
};

export default lastContact;
