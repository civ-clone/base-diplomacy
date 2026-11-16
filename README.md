# base-diplomacy

Baseline diplomacy a ruleset builds its rules from: contact, standing, war and peace, a computer player's stance at a
meeting and the steps of the meeting itself. Each is a plain function, and the ruleset passes in its own content (who
is a person, which units are nuclear, its leaders' tempers, which governments answer to a senate, the difficulty
level) and its own numbers, so it keeps its own rule ids, numbers and registration:

- `lib/Dependencies`: the registries the functions read. `playerWorldRegistry` is optional: only `shareMaps` needs
  it.
- `lib/Readers`: what the ruleset tells them about its content.
- `lib/standing`: `presence`, `landMassesOf`, `presenceOn`, `power`, `unitCount`, `gold`, `cityCount`, `atPeace`,
  `haveMet`, `atWar`, `traitScore`, `governedBy`, `rankFromTop` and `rankedFirst`.
- `lib/treatyLevel`: `treatyLevel(dependencies, player, other)`, how far the pair's treaties go (`TreatyLevel`: war <
  contact < ceasefire < peace < alliance); `hasTreatyLevel(dependencies, player, other, level)`, whether they reach
  `level`, which stops looking once they do; and `treatyName`. `atPeace` is `hasTreatyLevel(..., TreatyLevel.Peace)`:
  ask these rather than looking for a `Peace`, so ceasefires and alliances count. War and contact differ only for
  rule sets that make ceasefires (`makeCeasefire` ends the war): Civ1 counts any two who have met with no peace as at
  war (`atWar`).
- `lib/contact`: `contactOnMove(interactionRegistry, unitRegistry)`, the criteria and effect of a `Moved` rule that
  makes contact between players whose units meet.
- `lib/declareWar`: `declareWar(dependencies, player, other, forced?)`, which ends every treaty between them and
  tells the `DeclaredWar` rules (`Rules/DeclaredWar`: `(by, against, forced)`) whether `player` was made to declare
  it; `makePeace`, `makeCeasefire`, `makeAlliance` (an `Alliance` beside a `Peace`, so the pair stays at peace when
  `cancelAlliance` ends it) and `activeDeclarations`.
- `lib/embassy`: `hasEmbassy(dependencies, player, other)`, one way: an `Embassy` `player` holds with `other`, or
  any `HasEmbassy` rule (`Rules/HasEmbassy`) answering `true`, as a wonder that acts as an embassy with everyone
  would.
- `lib/patience`: `patience(dependencies, holder, toward)`, with `spent()`, `spend(amount?)` and `reset()`: how much of
  a computer player's patience with another is used up, kept between meetings.
- `lib/lastContact`: `lastContact(dependencies, player, other)` and `recordContact(dependencies, player, other,
  turn)`: the turn the pair were last in contact.
- `lib/shareMaps`: `shareMaps({ playerWorldRegistry }, player, other)`, each comes to know every square the other
  knows (and so what's on it: improvements and cities).
- `lib/personMeeting`: pieces for a meeting a person opens (`Negotiation#initiator()`), as `MeetingStep` rows:
  `audience`, `proposalMenu` (every proposal the ruleset makes that the `ProposalAvailable` rules allow, then leaving),
  `computerAnswer` (from the ruleset's `answer`), `patienceEnds`, all of them in `personMeetingSteps`; and
  `spendPatienceRules`, an `Interaction` rule spending the computer player's patience with each proposal. Every row
  applies only when a person opened the negotiation, so a meeting a computer player opens (`meetingSteps`) is
  untouched; `meetingFor` works a meeting out from the first player's side, so don't ask it for these.
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
- `Records/PatienceRecord` and `Records/LastContactRecord`: the saved records behind `patience` and `lastContact`,
  `RelationRecord`s in the `InteractionRegistry`, made only when a ruleset first writes one. Saves name them by class
  name, so a game that uses them registers them as saveable classes.
- `Dialogues/AdvanceTaken`: the `Dialogue` in which a player says which advance it took in an exchange of knowledge
  (key `exchange-knowledge.taken`). Saves name it by its class name, so a game registers it as a saveable class.

- `lib/rules/*`: rule assemblers, which build a ruleset's rules with its own id prefix (`<prefix>:...`) and numbers,
  rule for rule as civ1-diplomacy's: `expiredRules`, `interactionRules`, `stepRules`, `mayNegotiateRules` (with
  `MeetingSpacing`), `turnStartRules`, `resolvedRules`, `detonatedRules` and `movedRules`.

A library: it registers no rules. See `civ1-diplomacy` for Civilization's.
