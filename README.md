# base-diplomacy

Baseline diplomacy a ruleset builds its rules from: contact, standing, war and peace, a computer player's stance at a
meeting and the steps of the meeting itself. Each is a plain function, and the ruleset passes in its own content (who
is a person, which units are nuclear, its leaders' tempers, which governments answer to a senate, the difficulty
level) and its own numbers, so it keeps its own rule ids, numbers and registration:

- `lib/Dependencies`: the registries the functions read.
- `lib/Readers`: what the ruleset tells them about its content.
- `lib/standing`: `presence`, `landMassesOf`, `presenceOn`, `power`, `unitCount`, `gold`, `cityCount`, `atPeace`,
  `haveMet`, `atWar`, `traitScore`, `governedBy`, `rankFromTop` and `rankedFirst`.
- `lib/contact`: `contactOnMove(interactionRegistry, unitRegistry)`, the criteria and effect of a `Moved` rule that
  makes contact between players whose units meet.
- `lib/declareWar`: `declareWar`, `makePeace` and `activeDeclarations`.
- `lib/shamPeace`: `dropShamPeace(dependencies, player, random, chance)`, for a `TurnStart` rule.
- `lib/stance`: `stance(dependencies, readers, numbers, player, other, random?, changeGovernment?)`, how a computer
  player comes to a meeting, with `StanceNumbers`.
- `lib/wouldGoToWar`: `wouldGoToWar(dependencies, readers, threshold, player, other)`, whether two computer players
  meeting go to war.
- `lib/meeting`: `meetingFor(dependencies, rules, negotiation, random)`, the meeting worked out once per
  negotiation, `knownMeeting`, `negotiationOf` and `calm`.
- `lib/meetingSteps`: `meetingSteps(dependencies, rules, numbers)`, the meeting's steps in order, each a criterion
  and what comes next, for the ruleset to make `Step` rules of.
- `lib/knowledge`: `advancesLacked` and `give`.
- `lib/exchanged`: `recordTaken` and `takenBy`, what each player took in an exchange of knowledge.
- `Dialogues/AdvanceTaken`: the `Dialogue` in which a player says which advance it took in an exchange of knowledge
  (key `exchange-knowledge.taken`). Saves name it by its class name, so a game registers it as a saveable class.

- `lib/rules/*`: rule assemblers, which build a ruleset's rules with its own id prefix (`<prefix>:...`) and numbers,
  rule for rule as civ1-diplomacy's: `expiredRules`, `interactionRules`, `stepRules`, `mayNegotiateRules` (with
  `MeetingSpacing`), `turnStartRules`, `resolvedRules`, `detonatedRules` and `movedRules`.

A library: it registers no rules. See `civ1-diplomacy` for Civilization's.
