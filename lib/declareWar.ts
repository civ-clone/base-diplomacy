import Alliance from '@civ-clone/base-diplomacy-declaration-alliance/Alliance';
import { treatyLevel } from './treatyLevel';
import Ceasefire from '@civ-clone/base-diplomacy-declaration-ceasefire/Ceasefire';
import Declaration from '@civ-clone/core-diplomacy/Declaration';
import DeclaredWar from '../Rules/DeclaredWar';
import Dependencies from './Dependencies';
import Never from '@civ-clone/core-diplomacy/Expiries/Never';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Player from '@civ-clone/core-player/Player';
import ShamPeace from '@civ-clone/library-diplomacy/Declarations/ShamPeace';
import War from '@civ-clone/base-diplomacy-declaration-war/War';

const active = (
  dependencies: Dependencies,
  // Not `typeof Declaration`: a subclass with members of its own isn't assignable to it (civ-clone/web-renderer#21).
  DeclarationType: new (...args: any[]) => any,
  ...players: Player[]
): Declaration[] =>
  dependencies.interactionRegistry
    .getByPlayers(...players)
    .filter(
      (interaction): interaction is Declaration =>
        interaction instanceof DeclarationType &&
        (interaction as Declaration).active()
    );

// `player` goes to war with `other`: any treaty between them ends (a ceasefire, a peace, an alliance, which is a
//  peace), and so does a peace either meant to drop. `forced` when `player` was made to declare it, by something it did
//  under a treaty, rather than choosing war; the `DeclaredWar` rules hear which, once the war is declared, and the
//  treaty level it broke (`TreatyLevel`, as it stood before), so a rule set can tell an alliance, a peace, a ceasefire
//  or none apart.
export const declareWar = (
  dependencies: Dependencies,
  player: Player,
  other: Player,
  forced: boolean = false
): void => {
  const broken = treatyLevel(dependencies, player, other);

  active(dependencies, ShamPeace, player, other).forEach((sham) =>
    sham.expire(player)
  );
  active(dependencies, Peace, player, other).forEach((peace) =>
    peace.expire(player)
  );
  active(dependencies, Ceasefire, player, other).forEach((ceasefire) =>
    ceasefire.expire(player)
  );

  dependencies.interactionRegistry.register(
    new War(player, other, new Never(), dependencies.ruleRegistry)
  );

  dependencies.ruleRegistry.process(DeclaredWar, player, other, forced, broken);
};

// `player` and `other` make peace, unless they have already. Any ceasefire between them ends: the peace supersedes it.
export const makePeace = (
  dependencies: Dependencies,
  player: Player,
  other: Player
): void => {
  active(dependencies, Ceasefire, player, other).forEach((ceasefire) =>
    ceasefire.expire(player)
  );

  if (active(dependencies, Peace, player, other).length > 0) {
    return;
  }

  dependencies.interactionRegistry.register(
    new Peace(player, other, new Never(), dependencies.ruleRegistry)
  );
};

// Ends any war in force between the two: a ceasefire or an alliance supersedes it, so a pair whose ceasefire lapses is
//  left in contact rather than at war (`treatyLevel`).
const endWar = (
  dependencies: Dependencies,
  player: Player,
  other: Player
): void =>
  active(dependencies, War, player, other).forEach((war) => war.expire(player));

// `player` and `other` agree a ceasefire, unless they have one, or a peace, already. Any war between them ends.
export const makeCeasefire = (
  dependencies: Dependencies,
  player: Player,
  other: Player
): void => {
  if (
    active(dependencies, Peace, player, other).length > 0 ||
    active(dependencies, Ceasefire, player, other).length > 0
  ) {
    return;
  }

  endWar(dependencies, player, other);

  dependencies.interactionRegistry.register(
    new Ceasefire(player, other, new Never(), dependencies.ruleRegistry)
  );
};

// `player` and `other` become allies, unless they are already. An alliance implies peace, so they make peace first
//  (`makePeace`) and the `Alliance` stands beside that `Peace`: ending the alliance alone leaves them at peace. Any
//  ceasefire or war between them ends.
export const makeAlliance = (
  dependencies: Dependencies,
  player: Player,
  other: Player
): void => {
  if (active(dependencies, Alliance, player, other).length > 0) {
    return;
  }

  active(dependencies, Ceasefire, player, other).forEach((ceasefire) =>
    ceasefire.expire(player)
  );
  endWar(dependencies, player, other);
  makePeace(dependencies, player, other);

  dependencies.interactionRegistry.register(
    new Alliance(player, other, new Never(), dependencies.ruleRegistry)
  );
};

// `player` ends its alliance with `other`. They stay at peace: a `Peace` is made if the alliance stood alone.
export const cancelAlliance = (
  dependencies: Dependencies,
  player: Player,
  other: Player
): void => {
  const alliances = active(dependencies, Alliance, player, other);

  // No alliance, nothing to cancel: no peace is made either.
  if (alliances.length === 0) {
    return;
  }

  alliances.forEach((alliance) => alliance.expire(player));

  makePeace(dependencies, player, other);
};

export const activeDeclarations = active;

export default declareWar;
