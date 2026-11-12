import { calm, knownMeeting, meetingFor, MeetingRules } from '../lib/meeting';
import { MeetingStepNumbers, meetingSteps } from '../lib/meetingSteps';
import Criterion from '@civ-clone/core-rule/Criterion';
import Dialogue from '@civ-clone/core-diplomacy/Negotiation/Dialogue';
import Effect from '@civ-clone/core-rule/Effect';
import { IAction } from '@civ-clone/core-diplomacy/Negotiation/Action';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import { Stance } from '../lib/stance';
import Step from '@civ-clone/core-diplomacy/Rules/Negotiation/Step';
import { expect } from 'chai';
import position from './lib/position';
import { takenBy } from '../lib/exchanged';

const calmStance = (): Stance => ({
  atPeace: false,
  enemyAtPeaceWithOther: null,
  fear: 0,
  hostile: false,
  mode: 1,
  sham: false,
  tribute: 0,
  ultimatum: false,
  wasHostile: false,
});

const setup = (humanOther: boolean, war: boolean, senate = false) => {
  const built = position([{ senate }, { human: humanOther }]),
    calls = { stance: 0, wouldGoToWar: 0 },
    rules: MeetingRules = {
      isHuman: built.readers.isHuman,
      hasSenate: built.readers.hasSenate,
      wouldGoToWar: () => (calls.wouldGoToWar++, war),
      stance: () => (calls.stance++, { ...calmStance(), hostile: true }),
      changeGovernment: () => {},
    };

  return { ...built, calls, rules };
};

const numbers: MeetingStepNumbers = {
  openKnowledge: 6,
  provokingTribute: 50,
  goldUnit: 50,
  advanceGiftFear: 4,
  goldGift: (fear: number): number => 2 * fear - 4,
};

describe('meetingFor', (): void => {
  it('is worked out once per negotiation', (): void => {
    const { calls, dependencies, players, rules, ruleRegistry } = setup(
        false,
        true
      ),
      negotiation = new Negotiation(players[0], players[1], ruleRegistry);

    expect(knownMeeting(negotiation)).null;

    const meeting = meetingFor(dependencies, rules, negotiation, () => 0);

    expect(meetingFor(dependencies, rules, negotiation, () => 0)).equal(
      meeting
    );
    expect(knownMeeting(negotiation)).equal(meeting);
    expect(calls.stance).equal(1);
    expect(meeting.firstContact).true;
    expect(meeting.computer).equal('war');
  });

  it('decides peace between computer players unless one would go to war, and nothing for a person', (): void => {
    const peaceful = setup(false, false),
      senate = setup(false, true, true),
      person = setup(true, true),
      decide = ({ dependencies, players, rules, ruleRegistry }: any) =>
        meetingFor(
          dependencies,
          rules,
          new Negotiation(players[0], players[1], ruleRegistry),
          () => 0
        ).computer;

    expect(decide(peaceful)).equal('peace');
    // The second player would go to war too, and has no senate.
    expect(decide(senate)).equal('war');
    expect(decide(person)).null;
  });

  it('is calmed by what the other player gives', (): void => {
    const { dependencies, players, rules, ruleRegistry } = setup(true, false),
      negotiation = new Negotiation(players[0], players[1], ruleRegistry),
      meeting = meetingFor(dependencies, rules, negotiation, () => 0);

    expect(meeting.stance.hostile).true;

    calm({ by: () => players[0], negotiation: () => negotiation } as any);

    expect(meeting.stance.hostile).false;
  });
});

describe('meetingSteps', (): void => {
  const run = (humanOther: boolean, hostile: boolean): string[] => {
    const { dependencies, players, rules, ruleRegistry } = setup(
        humanOther,
        false
      ),
      steps = meetingSteps(
        dependencies,
        {
          meeting: (negotiation: Negotiation) =>
            meetingFor(
              dependencies,
              {
                ...rules,
                stance: () => ({ ...calmStance(), hostile }),
              },
              negotiation,
              () => 0
            ),
          hasSenate: rules.hasSenate,
          advanceTaken: () => {
            throw new Error('Nothing is exchanged here.');
          },
          takenBy,
        },
        numbers
      ),
      log: string[] = [];

    ruleRegistry.register(
      ...steps.map(
        ([applies, next]) =>
          new Step(
            new Criterion(
              (negotiation: Negotiation): boolean =>
                applies(negotiation) && next(negotiation) !== null
            ),
            new Effect(
              (negotiation: Negotiation): IAction => next(negotiation)!
            )
          )
      )
    );

    const negotiation = new Negotiation(players[0], players[1], ruleRegistry);

    for (let i = 0; i < 20 && !negotiation.terminated(); i++) {
      const chosen = negotiation.nextSteps()[0];

      log.push(
        chosen instanceof Dialogue
          ? `${chosen.constructor.name}:${chosen.key()}`
          : chosen.constructor.name
      );

      negotiation.proceed(chosen);
    }

    return log;
  };

  it('has two computer players meet and decide', (): void => {
    expect(run(false, false)).eql([
      'Initiate',
      'Accept',
      'Dialogue:computer.peace',
      'Acknowledge',
      'Terminate',
    ]);
  });

  it('offers a person peace, or declares war at first contact', (): void => {
    expect(run(true, false)).eql([
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
    expect(run(true, true)).eql([
      'Initiate',
      'Accept',
      'Dialogue:welcome.no-peace',
      'Acknowledge',
      'Dialogue:declare-war.first-contact',
      'Acknowledge',
      'Terminate',
    ]);
  });
});
