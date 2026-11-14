import { Alphabet, Bronze, Wheel, position } from './lib/position';
import { MeetingRules, knownMeeting, meetingFor } from '../lib/meeting';
import Accept from '@civ-clone/core-diplomacy/Proposal/Accept';
import Acknowledge from '@civ-clone/core-diplomacy/Proposal/Acknowledge';
import CancelTreaty from '@civ-clone/library-diplomacy/Proposals/CancelTreaty';
import Dialogue from '@civ-clone/core-diplomacy/Negotiation/Dialogue';
import { MeetingStepNumbers } from '../lib/meetingSteps';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import { Stance } from '../lib/stance';
import Advance from '@civ-clone/core-science/Advance';
import { expect } from 'chai';
import resolvedRules from '../lib/rules/resolved';
import stepRules from '../lib/rules/step';

class Pottery extends Advance {}

// The lifted `resolvedRules` and `stepRules` at work, beyond their shapes (`rules.test.ts`).

const stance = (overrides: Partial<Stance> = {}): Stance => ({
  atPeace: false,
  enemyAtPeaceWithOther: null,
  fear: 0,
  hostile: false,
  mode: 1,
  sham: false,
  tribute: 0,
  ultimatum: false,
  wasHostile: false,
  ...overrides,
});

const numbers: MeetingStepNumbers = {
  openKnowledge: 6,
  provokingTribute: 50,
  goldUnit: 50,
  advanceGiftFear: 4,
  goldGift: (fear: number): number => 2 * fear - 4,
};

const rulesFor = (
  built: ReturnType<typeof position>,
  meetingStance: Stance
): MeetingRules => ({
  isHuman: built.readers.isHuman,
  hasSenate: built.readers.hasSenate,
  wouldGoToWar: () => false,
  stance: () => meetingStance,
  changeGovernment: () => {},
});

describe('resolvedRules', (): void => {
  const cancelTreaty = async (random: number, waiveTribute: number) => {
    const built = position([{}, { human: true }, {}]),
      { dependencies, players, ruleRegistry } = built,
      [computer, person, enemy] = players,
      negotiation = new Negotiation(computer, person, ruleRegistry);

    meetingFor(
      dependencies,
      rulesFor(built, stance({ tribute: 100 })),
      negotiation,
      () => 0
    );

    const proposal = new CancelTreaty(
        enemy,
        computer,
        negotiation,
        ruleRegistry
      ),
      accept = new Accept(person, proposal, ruleRegistry),
      rule = resolvedRules('x', dependencies, () => random, waiveTribute).find(
        (rule) => rule.id() === 'x:proposal/resolved/cancel-treaty'
      )!;

    expect(rule.validate(accept, proposal)).true;

    await rule.process(accept, proposal);

    return knownMeeting(negotiation)!.stance.tribute;
  };

  it("waives the tribute after a cancelled treaty with the ruleset's chance", async (): Promise<void> => {
    expect(await cancelTreaty(0.4, 0.3)).equal(100);
    expect(await cancelTreaty(0.2, 0.3)).equal(0);
    expect(await cancelTreaty(0.6, 0.7)).equal(0);
  });

  it('has two computer players at peace each give the other the last advance it lacks', async (): Promise<void> => {
    const built = position([
        { advances: [Alphabet, Pottery] },
        { advances: [Bronze, Wheel] },
      ]),
      { advances, players, ruleRegistry, dependencies } = built,
      [first, second] = players,
      negotiation = new Negotiation(first, second, ruleRegistry),
      dialogue = new Dialogue(
        first,
        'computer.peace',
        negotiation,
        ruleRegistry
      ),
      acknowledge = new Acknowledge(second, dialogue, ruleRegistry),
      rule = resolvedRules('x', dependencies, () => 0.5, 0.5).find(
        (rule) => rule.id() === 'x:proposal/resolved/computer-peace'
      )!;

    expect(rule.validate(acknowledge, dialogue)).true;

    await rule.process(acknowledge, dialogue);

    // Each takes the other's last: the first Wheel, not Bronze; the second Pottery, not Alphabet.
    expect(advances.get(first)).eql([Alphabet, Pottery, Wheel]);
    expect(advances.get(second)).eql([Bronze, Wheel, Pottery]);
  });
});

describe('stepRules', (): void => {
  it('offers only the steps whose row applies: at the start, the greeting alone', (): void => {
    const built = position([{}, { human: true }]),
      { dependencies, players, ruleRegistry } = built,
      rules = rulesFor(built, stance()),
      steps = stepRules(
        dependencies,
        {
          meeting: (negotiation: Negotiation) =>
            meetingFor(dependencies, rules, negotiation, () => 0),
          hasSenate: rules.hasSenate,
        },
        numbers
      );

    ruleRegistry.register(...steps);

    const negotiation = new Negotiation(players[0], players[1], ruleRegistry),
      log: string[] = [],
      offered: number[] = [];

    for (let i = 0; i < 20 && !negotiation.terminated(); i++) {
      const next = negotiation.nextSteps();

      offered.push(next.length);

      const chosen = next[0];

      log.push(
        chosen instanceof Dialogue
          ? `${chosen.constructor.name}:${chosen.key()}`
          : chosen.constructor.name
      );

      negotiation.proceed(chosen);
    }

    expect(log).eql([
      'Initiate',
      'Accept',
      'Dialogue:welcome.no-peace',
      'Acknowledge',
      'OfferPeace',
      'Accept',
      'Dialogue:accept-peace.neutral',
      'Acknowledge',
      'Terminate',
    ]);
    expect(offered[0]).equal(1);
  });
});
