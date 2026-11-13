import { Bronze } from './lib/position';
import AdvanceTaken from '../Dialogues/AdvanceTaken';
import Dialogue from '@civ-clone/core-diplomacy/Negotiation/Dialogue';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { expect } from 'chai';

describe('AdvanceTaken', (): void => {
  it('says which advance a player took in an exchange of knowledge', (): void => {
    const ruleRegistry = new RuleRegistry(),
      by = new Player(ruleRegistry),
      other = new Player(ruleRegistry),
      negotiation = new Negotiation(by, other, ruleRegistry),
      taken = new AdvanceTaken(by, Bronze, negotiation, ruleRegistry);

    expect(taken).instanceOf(Dialogue);
    expect(taken.advance()).equal(Bronze);
    expect(taken.key()).equal('exchange-knowledge.taken');
    expect(taken.keys()).include('advance');
    // Saves name it by its class name.
    expect(AdvanceTaken.name).equal('AdvanceTaken');
  });
});
