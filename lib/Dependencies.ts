import CityRegistry from '@civ-clone/core-city/CityRegistry';
import ClientRegistry from '@civ-clone/core-client/ClientRegistry';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import LandMassRegistry from '@civ-clone/core-world/LandMassRegistry';
import PlayerGovernmentRegistry from '@civ-clone/core-government/PlayerGovernmentRegistry';
import PlayerRegistry from '@civ-clone/core-player/PlayerRegistry';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import PlayerTreasuryRegistry from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TraitRegistry from '@civ-clone/core-civilization/TraitRegistry';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';

// What the diplomacy arithmetic reads: the game's registries, gathered so a ruleset's rules can pass them on in one
//  go. A ruleset may pass an object with more in it.
export interface Dependencies {
  cityRegistry: CityRegistry;
  clientRegistry: ClientRegistry;
  interactionRegistry: InteractionRegistry;
  landMassRegistry: LandMassRegistry;
  playerGovernmentRegistry: PlayerGovernmentRegistry;
  playerRegistry: PlayerRegistry;
  playerResearchRegistry: PlayerResearchRegistry;
  playerTreasuryRegistry: PlayerTreasuryRegistry;
  ruleRegistry: RuleRegistry;
  traitRegistry: TraitRegistry;
  turn: Turn;
  unitRegistry: UnitRegistry;
}

export default Dependencies;
