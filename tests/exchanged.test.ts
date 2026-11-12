import { Bronze, Wheel } from './lib/position';
import { recordTaken, takenBy } from '../lib/exchanged';
import { IProposal } from '@civ-clone/core-diplomacy/Negotiation/Proposal';
import Player from '@civ-clone/core-player/Player';
import { expect } from 'chai';

describe('exchanged', (): void => {
  it('remembers what each player took in an exchange', (): void => {
    const proposal = {} as IProposal,
      other = {} as IProposal,
      a = {} as Player,
      b = {} as Player;

    expect(takenBy(proposal, a)).null;

    recordTaken(proposal, a, Bronze);
    recordTaken(proposal, b, Wheel);

    expect(takenBy(proposal, a)).equal(Bronze);
    expect(takenBy(proposal, b)).equal(Wheel);
    expect(takenBy(other, a)).null;
  });
});
