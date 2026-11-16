import Player from '@civ-clone/core-player/Player';
import Rule from '@civ-clone/core-rule/Rule';

/**
 * Whether `player` has an embassy with `other` without an `Embassy` of its own there, say through a wonder that acts
 *  as an embassy with everyone. Any rule answering `true` is enough (`hasEmbassy`).
 */
export class HasEmbassy extends Rule<
  [player: Player, other: Player],
  boolean
> {}

export default HasEmbassy;
