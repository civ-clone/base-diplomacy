import { IProposal } from '@civ-clone/core-diplomacy/Negotiation/Proposal';
import Dependencies from './Dependencies';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';
import { Stance } from './stance';
import { atPeace } from './standing';
import isPacified from '@civ-clone/library-diplomacy/lib/isPacified';

// Where a meeting has got to, kept for as long as the negotiation lasts. It isn't saved: a negotiation runs to its
//  end within the turn it starts in.
export interface Meeting {
  // The computer player who came to talk, and the player it came to.
  player: Player;
  other: Player;
  // Two computer players meet without a parley (`wouldGoToWar`): `computer` is what they decide.
  computer: 'war' | 'peace' | 'nothing' | null;
  stance: Stance;
  // Whether this is the first time the two have met.
  firstContact: boolean;
}

// What a ruleset decides a meeting with.
export interface MeetingRules {
  // Whether a person plays `player`.
  isHuman: (player: Player) => boolean;
  // Whether `player`'s government answers to a senate, which keeps it from war between computer players.
  hasSenate: (player: Player) => boolean;
  // Whether computer player `player` would go to war with computer player `other`.
  wouldGoToWar: (player: Player, other: Player) => boolean;
  // How `player` comes to the meeting (`stance`), given the coin and the government change.
  stance: (
    player: Player,
    other: Player,
    random: () => number,
    changeGovernment: (player: Player) => void
  ) => Stance;
  // What a player whose senate won't let it threaten does instead: it changes government.
  changeGovernment: (player: Player) => void;
}

const meetings = new WeakMap<Negotiation, Meeting>();

// The computer pair's decision: war if either would go to war with the other (neither with a player the `Pacified`
//  rules protect, nor one with a senate), otherwise peace. War between two at war already changes nothing; peace
//  between two at peace still trades advances.
const computerDecision = (
  dependencies: Dependencies,
  rules: MeetingRules,
  player: Player,
  other: Player,
  firstContact: boolean
): 'war' | 'peace' | 'nothing' => {
  const wants = (a: Player, b: Player): boolean =>
    rules.wouldGoToWar(a, b) &&
    !isPacified(a, b, dependencies.ruleRegistry) &&
    !rules.hasSenate(a);

  if (wants(player, other) || wants(other, player)) {
    return atPeace(dependencies, player, other) || firstContact
      ? 'war'
      : 'nothing';
  }

  return 'peace';
};

// The meeting for `negotiation`, worked out the first time it's asked for: that is when the coin is tossed and a
//  government may change.
export const meetingFor = (
  dependencies: Dependencies,
  rules: MeetingRules,
  negotiation: Negotiation,
  random: () => number
): Meeting => {
  const known = meetings.get(negotiation);

  if (known !== undefined) {
    return known;
  }

  const [player, other] = negotiation.players(),
    firstContact = !dependencies.interactionRegistry
      .getByPlayers(player, other)
      .some(
        (interaction) =>
          interaction instanceof Negotiation && interaction !== negotiation
      ),
    computer = !rules.isHuman(player) && !rules.isHuman(other),
    meeting: Meeting = {
      player,
      other,
      computer: computer
        ? computerDecision(dependencies, rules, player, other, firstContact)
        : null,
      stance: rules.stance(player, other, random, rules.changeGovernment),
      firstContact,
    };

  meetings.set(negotiation, meeting);

  return meeting;
};

// The meeting for `negotiation` if it's been worked out, without working it out.
export const knownMeeting = (negotiation: Negotiation): Meeting | null =>
  meetings.get(negotiation) ?? null;

// The negotiation a proposal was made in.
export const negotiationOf = (proposal: IProposal): Negotiation =>
  (proposal as unknown as { negotiation(): Negotiation }).negotiation();

// Whatever the other player gives the computer player calms it: it's no longer hostile.
export const calm = (proposal: IProposal): void => {
  const meeting = knownMeeting(negotiationOf(proposal));

  if (meeting !== null && proposal.by() === meeting.player) {
    meeting.stance.hostile = false;
  }
};

export default meetingFor;
