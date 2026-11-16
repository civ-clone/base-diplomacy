import { IProposal } from '@civ-clone/core-diplomacy/Negotiation/Proposal';
import Rule from '@civ-clone/core-rule/Rule';
/**
 * Whether `proposal` may be offered in a meeting a person leads (`proposalMenu`): it's offered when at least one rule
 *  answers and every answer is `true`, so a proposal no rule speaks for is never offered.
 */
export declare class ProposalAvailable extends Rule<
  [proposal: IProposal],
  boolean
> {}
export default ProposalAvailable;
