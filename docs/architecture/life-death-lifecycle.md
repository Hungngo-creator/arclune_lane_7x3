# Canonical life/death lifecycle

```mermaid
stateDiagram-v2
  alive --> hp-zero: committed lethal HP change
  hp-zero --> death-prevention: open wave
  death-prevention --> alive: DEATH_PREVENTED (HP >= 1)
  death-prevention --> dead-confirmed: DEATH_CONFIRMED
  dead-confirmed --> alive: immediate REVIVE_COMMITTED
  alive --> removed: removal/despawn
  alive --> erased: erase
```

`alive` is only a compatibility projection. The canonical event order is `ACTION_COMMITTED`/HP commits, `HP_ZERO`, `DEATH_PREVENTION_OPENED`, the complete prevention pass, batched `DEATH_CONFIRMED`, `KILL_CREDIT_GRANTED`, immediate revive, and battle-end evaluation. Candidates and confirmed deaths are deduplicated by `iid + lifeSerial`. Session sequence state supplies deterministic event and death serials.

