# Death prevention contract

A `DeathPreventionRequest` contains an immutable `HPZeroCandidate` and declarative decisions. A winning decision must restore at least one HP. Prevention does not confirm a death, grant a kill, increment `lifeSerial`, or invoke revive. Decisions are intended to be sorted by canonical authority, explicit priority, then stable registration order; C1 exposes authority metadata without adding an Axiom system.

