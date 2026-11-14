import { MeetingStepNumbers } from '../lib/meetingSteps';
import { MeetingRules, meetingFor } from '../lib/meeting';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';
import Rule from '@civ-clone/core-rule/Rule';
import detonatedRules from '../lib/rules/detonated';
import { expect } from 'chai';
import expiredRules from '../lib/rules/expired';
import interactionRules from '../lib/rules/interaction';
import mayNegotiateRules from '../lib/rules/mayNegotiate';
import movedRules from '../lib/rules/moved';
import position from './lib/position';
import resolvedRules from '../lib/rules/resolved';
import stepRules from '../lib/rules/step';
import turnStartRules from '../lib/rules/turnStart';

// civ1-diplomacy's rules as its master (70b953e) builds them: id, rule class, priority value and criteria count, from
//  its compiled `getRules` with the default game's registries. The assemblers, given civ1-diplomacy's prefix and
//  numbers, must build the same (Civ1 adopting them is then a drop-in). `Rules/City/captured` isn't lifted.
const civ1: Record<string, [string | null, string, number, number][]> = {
  'Rules/Declaration/expired': [
    ['civ1-diplomacy:declaration/expired/announce', 'Expired', 2000, 1],
  ],
  'Rules/Negotiation/interaction': [
    ['civ1-diplomacy:negotiation/interaction/register', 'Interaction', 2000, 0],
    [
      'civ1-diplomacy:negotiation/interaction/sham-peace',
      'Interaction',
      2000,
      0,
    ],
  ],
  'Rules/Negotiation/step': [
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
    [null, 'Step', 2000, 1],
  ],
  'Rules/Player/may-negotiate': [
    [
      'civ1-diplomacy:player/may-negotiate/not-the-barbarians',
      'MayNegotiate',
      2000,
      1,
    ],
    [
      'civ1-diplomacy:player/may-negotiate/with-the-human',
      'MayNegotiate',
      2000,
      1,
    ],
    [
      'civ1-diplomacy:player/may-negotiate/computer-players',
      'MayNegotiate',
      2000,
      1,
    ],
  ],
  'Rules/Player/turn-start': [
    ['civ1-diplomacy:player/turn-start/drop-sham-peace', 'TurnStart', 2000, 0],
  ],
  'Rules/Proposal/resolved': [
    ['civ1-diplomacy:proposal/resolved/peace', 'Resolved', 2000, 1],
    ['civ1-diplomacy:proposal/resolved/tribute', 'Resolved', 2000, 1],
    ['civ1-diplomacy:proposal/resolved/cancel-treaty', 'Resolved', 2000, 1],
    [
      'civ1-diplomacy:proposal/resolved/exchange-knowledge',
      'Resolved',
      2000,
      1,
    ],
    ['civ1-diplomacy:proposal/resolved/declare-war', 'Resolved', 2000, 1],
    ['civ1-diplomacy:proposal/resolved/computer-peace', 'Resolved', 2000, 1],
  ],
  'Rules/Unit/detonated': [
    ['civ1-diplomacy:unit/detonated/vendetta', 'Detonated', 1000, 0],
  ],
  'Rules/Unit/moved': [[null, 'Moved', 2000, 2]],
};

const shape = (rules: Rule<any, any>[]) =>
  rules.map((rule: any) => [
    rule.id(),
    rule.constructor.name,
    rule.priority().value(),
    rule._criteria ? (rule._criteria._criteria ?? []).length : 0,
  ]);

const numbers: MeetingStepNumbers = {
  openKnowledge: 6,
  provokingTribute: 50,
  goldUnit: 50,
  advanceGiftFear: 4,
  goldGift: (fear: number): number => 2 * fear - 4,
};

describe('rule assemblers', (): void => {
  const { dependencies, readers } = position([{}, { human: true }]),
    random = () => 0.5,
    prefix = 'civ1-diplomacy',
    rules: MeetingRules = {
      isHuman: readers.isHuman,
      hasSenate: readers.hasSenate,
      wouldGoToWar: () => false,
      stance: () => {
        throw new Error('not asked');
      },
      changeGovernment: () => {},
    },
    engine = { emit: () => {} } as any;

  it("build civ1-diplomacy's rules, rule for rule, from its prefix", (): void => {
    expect(
      shape(expiredRules(prefix, engine, dependencies.interactionRegistry))
    ).eql(civ1['Rules/Declaration/expired']);
    expect(shape(interactionRules(prefix, dependencies))).eql(
      civ1['Rules/Negotiation/interaction']
    );
    expect(
      shape(
        stepRules(
          dependencies,
          {
            meeting: (negotiation: Negotiation) =>
              meetingFor(dependencies, rules, negotiation, random),
            hasSenate: readers.hasSenate,
          },
          numbers
        )
      )
    ).eql(civ1['Rules/Negotiation/step']);
    expect(
      shape(
        mayNegotiateRules(prefix, dependencies, readers.isHuman, {
          withPerson: 16,
          withPersonAfterTreaty: 32,
          computers: 4,
        })
      )
    ).eql(civ1['Rules/Player/may-negotiate']);
    expect(shape(turnStartRules(prefix, dependencies, random, 1 / 3))).eql(
      civ1['Rules/Player/turn-start']
    );
    expect(shape(resolvedRules(prefix, dependencies, random, 0.5))).eql(
      civ1['Rules/Proposal/resolved']
    );
    expect(shape(detonatedRules(prefix, dependencies))).eql(
      civ1['Rules/Unit/detonated']
    );
    expect(
      shape(
        movedRules(dependencies.interactionRegistry, dependencies.unitRegistry)
      )
    ).eql(civ1['Rules/Unit/moved']);
  });

  it("use the ruleset's prefix", (): void => {
    expect(
      shape(turnStartRules('civ2-diplomacy', dependencies, random, 1 / 3))[0][0]
    ).equal('civ2-diplomacy:player/turn-start/drop-sham-peace');
  });

  it("space a person's meetings by the ruleset's numbers", (): void => {
    const { dependencies, players, readers } = position(
        [{}, { human: true }, {}],
        { turn: 100 }
      ),
      [computer, person, other] = players,
      lastMet = Object.assign(Object.create(Negotiation.prototype), {
        when: () => 90,
      }),
      withLastMeeting = {
        ...dependencies,
        interactionRegistry: {
          getByPlayers: () => [lastMet],
        } as any,
      },
      may = (
        spacing: Parameters<typeof mayNegotiateRules>[3],
        player: Player,
        another: Player
      ) =>
        mayNegotiateRules('x', withLastMeeting, readers.isHuman, spacing)
          .filter((rule) => rule.validate(player, another))
          .map((rule) => rule.process(player, another));

    expect(
      may(
        { withPerson: 10, withPersonAfterTreaty: 32, computers: 4 },
        computer,
        person
      )
    ).eql([true]);
    expect(
      may(
        { withPerson: 11, withPersonAfterTreaty: 32, computers: 4 },
        computer,
        person
      )
    ).eql([false]);
    expect(
      may(
        { withPerson: 16, withPersonAfterTreaty: 32, computers: 10 },
        computer,
        other
      )
    ).eql([true]);
    expect(
      may(
        { withPerson: 16, withPersonAfterTreaty: 32, computers: 11 },
        computer,
        other
      )
    ).eql([false]);
  });
});
