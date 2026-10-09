# ARCLUNE — AGENTS.md
## Repository reasoning constitution for Codex

> This file tells Codex **how to reason and work** in ARCLUNE.
>
> It is not canonical gameplay and is not one of the canonical `00–08` architecture files.
>
> It distills the stable reasoning doctrine from the former R7 handoff while intentionally removing Pilot snapshots, old patch IDs, and temporary project-state assumptions.

---

# 1. SOURCE OF TRUTH

The GitHub repository is the only project source of truth.

Unless the user explicitly names another canonical branch/ref:

```text
main / designated canonical branch
= current merged canon

working branch / PR / unmerged diff
= proposed delta
```

Do not treat these as current canon merely because they exist:

- chat memory;
- old ChatGPT Project files;
- phone-local copies;
- downloaded duplicates;
- old patch proposals;
- old audit artifacts;
- old handoff snapshots;
- filenames that merely look newer.

If an external file is supplied, classify it correctly:

```text
gameplay source
proposal
audit input
merge input
reference only
```

Do not silently promote it to repository canon.

---

# 2. SELF-AUDIT THIS FILE FIRST

Before substantive work, check this file against the immediate task and current repository for:

```text
STALE SNAPSHOT
CONTRADICTION
OVERCONSTRAINT
WRONG LAYER
WRONG NAMESPACE
EXAMPLE PROMOTED TO CANON
CANDIDATE GAP PROMOTED TO APPROVED GAP
OLD PROPOSAL PROMOTED TO CURRENT CANON
```

If this file conflicts with:

1. current explicit user instruction;
2. later explicit designer correction;
3. latest active Clarified Gameplay Canon on that gameplay point;
4. latest actual merged repository architecture;

follow the authoritative current source.

This file guides **how to reason**, not **what currently exists**.

---

# 3. TWO AUTHORITY AXES

Do not collapse current architecture state and gameplay intent.

## Architecture state

```text
latest actual merged repository canon
```

defines what currently exists.

An approved but unmerged change is:

```text
APPROVED DELTA
```

not current canon.

## Gameplay meaning

Use:

```text
latest explicit designer instruction/correction
>
latest non-superseded Clarified Gameplay Canon
>
raw kit prose as provenance/design intent
>
examples only as examples unless explicitly locked
```

A Character Clarified Gameplay Canon defines gameplay meaning.

It does not directly rewrite architecture.

It may prove that architecture needs a reusable extension.

---

# 4. TASK MODE FIRST

Determine the task mode before loading broadly:

```text
DESIGN
CLARIFY_GAMEPLAY
NORMALIZE_CHARACTER
AUDIT_PROPOSAL
PATCH_ONE_FILE
PATCH_MULTI_FILE
MERGE
AUDIT_MERGED_FILE
GENERAL_ARCHITECTURE_ANALYSIS
REPO_MAINTENANCE
```

The user's requested scope is binding.

Examples:

```text
"05 only"
→ inspect dependencies as needed
→ edit only 05

"audit only"
→ do not merge unless asked

"normalization only"
→ do not silently patch architecture

"merge this patch"
→ do not redesign gameplay

"design ideas"
→ preserve creativity
→ do not constrain ideas around current architecture unless asked
```

An unresolved issue blocks only work that actually depends on it.

---


# 4A. PROJECT PHASE GATE — ARCHITECTURE BEFORE IMPLEMENTATION

ARCLUNE is currently in:

```text
ARCHITECTURE PHASE
```

until the user explicitly declares:

```text
IMPLEMENTATION PHASE
```

The current objective is:

```text
Raw Kits
→ Clarified Gameplay Canons
→ representative Pilot normalization
→ mature canonical 00–08 architecture
→ architecture stress coverage
→ broad roster normalization

before implementation code is rebuilt around the finalized semantic system.
```

During `ARCHITECTURE PHASE`, focus on:

- Clarified Gameplay Canons;
- canonical architecture `00–08`;
- cross-file semantic consistency;
- architecture-level Stress Tests in `08`;
- representative Character normalization;
- removal of Character-specific hardcoding pressure at the design level.

During `ARCHITECTURE PHASE`, do **not** by default:

- run `node build.mjs`;
- run app/runtime/unit/integration tests;
- run Unity/game builds;
- modify `src/`, `dist/`, generated bundles, simulations, or runtime implementation merely to make old implementation match new architecture;
- implement newly-defined `00–08` semantics in code;
- weaken correct architecture because existing implementation does not support it yet.

Executable build/runtime validation is required only when:

1. the user explicitly asks for implementation validation; or
2. the current task actually modifies executable implementation code; or
3. the user explicitly declares `IMPLEMENTATION PHASE`.

For architecture/documentation work, validation should normally be limited to lightweight non-implementation checks such as:

```text
inspect actual diff
git diff --check
Markdown/reference consistency
canonical ID/reference consistency
cross-file semantic consistency
duplicate/conflicting definition checks
AGENTS.md six-pass self-audit
```

Do not run executable tests merely because they exist in the repository.

`08_STRESS_TESTS.md` is currently an architecture validation specification.

During `ARCHITECTURE PHASE`:

```text
writing/updating 08 tests
≠
implementing/running executable game tests
```

When `IMPLEMENTATION PHASE` is explicitly activated, revisit this restriction. At that point implementation code, runtime tests, simulation tests, builds, and integration validation become normal required work.

An explicitly authorized prototype remains subordinate to current canon. Before extending it, compare its relevant assumptions with the latest merged architecture and designer locks; correct stale assumptions in the prototype, preserve exact authored exceptions, and reject unsupported semantics. Record the verified source/ref and experimental scope in the prototype's own documentation. Prototype defaults, successful traces and passing tests are not gameplay authority or proof of full architecture support; never feed them back into Character Canon or `00–08` as design constraints. Prototype authorization alone does not change the Project Phase.

---

# 5. MINIMUM NECESSARY SOURCE LOADING

Read the smallest authoritative source set that can prove correctness.

For a narrow architecture task, normally inspect:

1. current canonical index;
2. latest actual target merge base;
3. directly relevant canonical dependencies;
4. active Character Clarified Gameplay Canon + later corrections;
5. relevant Stress Tests when they encode regression obligations;
6. proposal only after independently deriving what is required.

Do not mechanically read all `00–08` for every task.

Do not claim an exact merge-ready result without inspecting the latest actual target base.

---

# 6. CANON-FIRST, PROPOSAL-SECOND

For audit/patch/merge work:

```text
latest repo canon
+ locked gameplay
+ relevant approved delta
→ independently derive required semantics
→ attempt composition
→ identify exact missing boundary, if any
→ only then inspect proposal
```

Never reason:

```text
proposal exists
→ find reasons to justify it
```

A proposal is candidate work.

Be willing to reject your own earlier solution.

---

# 7. CORE ARCHITECTURE DOCTRINE

```text
Character = declarative data/composition
Kernel = generic deterministic runtime
```

Preserve gameplay meaning first.

Then ask:

```text
Can current architecture express this correctly by composition?
```

Only if the answer is genuinely no should architecture grow.

Never create architecture merely to make one kit easy to implement.

Avoid:

- Character-specific Kernel branches;
- Character-specific runtime managers;
- arbitrary scripting VMs;
- arbitrary callback/hook registries;
- hidden ordering;
- generic priority systems not independently required.

---

# 8. ARCHITECTURE STACK / LAYER OWNERSHIP

Canonical conceptual stack:

```text
Terminology
→ Functional Tags
→ Ability Schema
→ Normalizer / Compiler
→ Normalized IR
→ Primitives + Contracts
→ Kernel Runtime
→ Mode Profiles
→ Stress Tests
```

Use this ownership guide:

```text
stable semantic meaning
→ Terminology

queryable semantic capability
→ Functional Tag

typed declarative author intent
→ Ability Schema

validation / lowering / canonicalization
→ Normalizer

execution-ready typed representation
→ Normalized IR

reusable atomic executable operation
→ Primitive

timing / ordering / atomicity / failure / lifecycle law
→ Contract

runtime state / scheduler / transaction execution
→ Kernel

mode-owned scheduler/resource/spatial variation
→ Mode Profile

regression proof
→ Stress Test
```

A correct idea in the wrong layer is still a bad patch.

---

# 9. GAP BURDEN OF PROOF

Before accepting a generic architecture gap, prove:

```text
1. locked gameplay semantic;
2. current canonical capability;
3. exact composition attempted;
4. exact semantic failure;
5. why the failure is semantic, not merely inconvenient authoring;
6. why the missing concept is reusable beyond one Character;
7. correct owner/layer;
8. smallest bounded typed extension;
9. files that actually require change;
10. files that remain unchanged;
11. ambiguity/invalid content the Normalizer must reject;
12. Stress Tests that prove the semantics.
```

If these cannot be answered:

> the gap is not yet proven.

Prefer:

```text
existing object + typed field/value
```

over:

```text
new subsystem + new ID family
```

when semantically sufficient.

---

# 10. LAYER DISCIPLINE

## Terminology

Terminology defines stable meaning.

Do not put runtime algorithms, transaction state machines, Schema syntax manuals, or Character rules into Terminology.

Do not mint a new term for wording preference.

Renaming a canonical ID is migration.

## Functional Tags

A Tag is queryable semantic capability vocabulary.

A Tag is not automatically:

- every mechanic noun;
- timing checkpoint;
- enum value;
- selector;
- lifecycle cause;
- resource parameter;
- Authority tier;
- Character label.

Tag ↔ Primitive is many-to-many.

New Tag burden of proof is high.

## Primitives

Primitive = reusable atomic executable operation.

A complex mechanic does not imply a new Primitive.

Prefer composition of existing operations plus Schema/Contract/runtime orchestration.

Never create Character-shaped Primitives.

## Schema / Normalizer

Schema must preserve relevant:

- owner;
- source;
- recipient;
- scope;
- reference anchor;
- timing anchor;
- failure policy;
- snapshot/re-query policy;
- lifetime;
- result binding.

Normalizer fails closed on observable ambiguity.

Forbidden hidden defaults include:

```text
first list item wins
entity ID breaks tie
Slot breaks tie
Event sequence becomes priority
same rootActionId means root-owned direct Effect
missing lifecycle cause guessed
missing re-query policy guessed
```

If observable gameplay depends on undeclared order:

```text
require explicit semantics
or
reject executable content
```

## Contracts

Contracts own reusable semantic law:

- ordering;
- timing;
- atomicity;
- validation/admission;
- failure propagation;
- snapshot/re-query;
- lifecycle;
- cost semantics;
- effect resolution.

Do not turn one Character's explicit local profile into a global default.

## Kernel

Kernel is a generic deterministic interpreter of normalized IR.

For every new mutable runtime state, identify:

```text
owner/key
creation
mutation
terminal condition
cleanup
lifetime
serialization/replay requirement
```

Do not let internal service-call order become gameplay semantics.

---

# 11. DETERMINISM / PRIORITY

Keep distinct:

```text
event emission
candidate eligibility
candidate scheduling
gameplay priority
trace order
```

Trace/Event sequence is not gameplay priority unless a Contract explicitly says so.

Never infer gameplay priority from:

- list order;
- authoring order;
- Character ID;
- entity ID;
- Slot;
- insertion order;
- incidental iteration;
- Event sequence.

If multiple candidates can apply and order changes gameplay:

```text
explicit dependency / priority Contract
or
normalization rejection / REQUIRED_EXPLICIT
```

No hidden winner.

---

# 12. HARD SEMANTIC DISTINCTIONS

Never collapse these unless current explicit canon does:

```text
Action lineage
≠ Effect provenance
≠ Damage Attribution
≠ Action Actor/source identity

Natural Action opportunity
≠ actually performed/completed Natural Action

ACTION INTENT / REQUEST
≠ ADMITTED ACTION
≠ ACTION_BEGIN
≠ ACTION_DIRECT_EFFECTS_COMPLETE
≠ ACTION_COMPLETED

HP Cost
≠ HP Loss
≠ Damage

Heal
≠ Overheal
≠ Shield
≠ Damage Reduction

Base Deployment Cost
≠ Current Deployment Cost
≠ Side Deployment Cost Bar

Deck membership
≠ current deployment state
≠ Field Presence

LEAVE_FIELD
≠ RETURN_TO_DECK
≠ Death
≠ Temporary Absence
≠ Removed/Erased

State classification
≠ State Retention Scope
≠ Duration clock

transition cleanup
≠ Cleanse
≠ natural expiry
≠ Shield break/depletion

live reference
≠ Snapshot
≠ committed Result
≠ nominal Formula

trace/Event order
≠ gameplay priority
```

---

# 13. SSI / ACTION CORE

For turn-based SSI, preserve:

```text
Natural Action
→ global TURN_BOUNDARY
→ next Natural Action
→ global TURN_BOUNDARY
→ ...
```

Do not invent Actor-private Turn Boundaries.

Action identity, Action behavior, and Natural-Action status are separate.

Follow-up / Counter / Reaction / child Action do not advance SSI by default.

A CC-lost opportunity may consume an SSI opportunity without an actual Action.

Always determine what a mechanic counts:

```text
Natural Action opportunity
actual Action
Action start
ACTION_DIRECT_EFFECTS_COMPLETE
ACTION_COMPLETED
global TURN_BOUNDARY
```

---

# 14. ACTION INTENT / COMPLETION

Keep:

```text
ACTION INTENT / REQUEST
≠ ADMITTED ACTION
≠ ACTION_DIRECT_EFFECTS_COMPLETE
≠ ACTION_COMPLETED
```

Bounded Action-Intent interposition must use only currently supported anchors.

Fallback inside one preserved Intent must not accidentally create another Intent cycle unless explicit gameplay says so.

Local completion dependencies are dependency graphs.

They are not global Reaction priority.

---

# 15. ACTION LINEAGE / EFFECT PROVENANCE

Same `rootActionId` does not mean:

```text
root-owned direct Effect
```

A child Action may share the same root while remaining a distinct Action with distinct Effect provenance.

When gameplay says:

```text
direct Damage from this Natural Action
```

prove both:

- Action-lineage relation;
- Effect-provenance/direct-effect ownership.

Do not substitute Damage Attribution for either.

---

# 16. DAMAGE / ACTUAL HP DAMAGE

Do not emulate semantic Damage-type conversion with:

- 100% Penetration;
- post-mitigation relabeling;
- Final Damage Reduction;

unless gameplay actually means that.

Actual HP Damage is committed HP actually removed after the contracted Damage/Shield pipeline.

It excludes:

- raw/nominal packet amount;
- Shield absorption;
- overkill beyond HP actually removed.

When gameplay depends on actual result:

```text
consume committed Damage Result
```

not reconstructed nominal formulas.

---

# 17. HP COST / COST RESULTS

Keep:

```text
HP Cost
≠ HP Loss
≠ Damage
```

HP Cost is payer-owned Cost semantics.

It does not automatically:

- use Shield;
- Reflect;
- Lifesteal;
- trigger ordinary Damage reactions.

Requested amount and actual paid amount may differ.

```text
actualPaidAmount = 0
```

does not automatically mean failure.

For distributed Costs:

- freeze dynamic payer membership at the contracted checkpoint;
- preserve one typed result per payer;
- preserve required vs optional payer semantics;
- do not mark the group terminal early;
- do not reconstruct actual payment from nominal formulas.

---

# 18. HEAL / OVERHEAL / SHIELD

Heal, Overheal, Shield, and Damage Reduction are separate semantics.

Apply modifiers at their contracted phase.

When Overheal depends on modified Heal:

```text
modify Heal
→ resolve restoration
→ derive Overheal
```

Overheal conversion is separate composition.

Preserve Shield source contribution provenance/ledger when current canon requires it.

Manual/source/lifecycle removal must preserve terminal cause.

Do not trigger:

```text
natural expiry
break/depletion
```

from unrelated cleanup unless Contract explicitly equates those causes.

---

# 19. LIFECYCLE / PRESENCE / DEPLOYMENT

Keep distinct:

- alive/dead lifecycle;
- Field Presence;
- deployment state;
- Deck membership;
- Temporary Absence;
- Arena transfer;
- Removed/Erased.

`LEAVE_FIELD` does not automatically mean:

```text
Death
Return-to-Deck
Removed
Temporary Absence
```

Deck membership does not automatically mean deployable.

A transition spanning multiple runtime owners requires one coherent authoritative commit boundary.

Do not expose half-states.

---

# 20. STATE RETENTION / CLEANUP

Lifecycle/deployment retention is not automatically Cleanse.

A transition may define:

```text
what persists
what is discarded
what terminal cause cleanup records
```

without creating a Cleanse Effect or Authority contest.

Do not use Authority as a generic excuse for persistence when gameplay defines non-retention.

Do not invent cleanup beyond declared categories/scopes.

---

# 21. AUTHORITY

Authority is semantic-conflict authority, not general power level.

Do not infer Authority from:

- Rank;
- Class;
- Element;
- rarity;
- lore status;
- god/vampire/etc.

Enter Authority adjudication only when actual Authority-bearing clauses directly conflict.

Do not solve same-Character contradictory clauses by progression-ranking the Character against itself.

---

# 22. MODE PROFILE DISCIPLINE

Mode Profiles own mode variation such as:

- scheduler;
- spatial representation;
- mode resources;
- genuinely mode-owned lifecycle/deployment variation.

Core semantics should not fork by Mode without proof.

A mechanic occurring in one Mode does not automatically belong in the Mode Profile.

Inspect latest `07` before patching a mode rule.

---

# 23. FAILURE TAXONOMY

Keep distinct:

```text
normalization rejection
Action Intent rejection
Action admission failure
Cost failure
target invalidation
Effect admission rejection
Effect-local failure
settlement failure
lifecycle invalidity
transition failure
Action cancellation
```

For every new rule answer:

```text
what failed?
what already committed?
what must not commit?
does enclosing Action continue?
does only a local branch fail?
is refund allowed?
is use-count consumed?
is a Result recorded?
is pending retry created?
```

Never infer:

```text
FAIL_EFFECT → FAIL_ACTION
```

or:

```text
zero result → failure
```

without gameplay/Contract support.

---

# 24. ATOMIC TRANSITION RULE

For a transition crossing multiple runtime owners, audit:

- presence;
- lifecycle/deployment state;
- Deck membership;
- State/Shield retention;
- transition cause;
- later legality.

Define one authoritative commit barrier.

Prevent states such as:

```text
Field Presence removed
but deployment state still active

deployment state says Deck
but active Field Presence remains

cleanup fires as natural expiry
before transition cause exists
```

Internal service-call order is not gameplay order.

---

# 25. CHARACTER WORKFLOW

## Raw kit

Raw kit is:

```text
designer source / provenance / intent
```

Do not silently resolve ambiguity.

## Clarified Gameplay Canon

Create/update a Character Clarified Gameplay Canon before architecture patching when raw prose leaves execution semantics ambiguous.

Lock where relevant:

- owner/source/recipient;
- trigger/checkpoint;
- target selection;
- snapshot vs live read;
- Action lineage/provenance;
- cost/payer/result semantics;
- clock/lifetime;
- caps/floors/counts;
- failure;
- lifecycle validity;
- transition cause;
- terminal behavior.

If unresolved semantics do not affect the current architecture task:

```text
mark unresolved
continue
```

If essential:

```text
stop only the blocked part
ask the designer
```

Never invent gameplay merely to make architecture easier.

## Character selection when the user does not name one

If asked to continue normalization without a specified Character, Codex may choose the next raw kit.

Choose for **information value**, not alphabetically.

Prefer a Character with:

- useful under-tested architecture pressure;
- semantic diversity;
- subsystem coverage;
- sufficiently clear raw-kit material;
- value as a representative Pilot.

Before choosing, inspect:

- existing Clarified Canon coverage;
- architecture areas already strongly tested;
- kits that would be blocked immediately by missing designer intent.

Do not choose novelty merely to force architecture growth.

## Normalize

After gameplay is sufficiently locked:

```text
mechanic
→ map to current architecture
→ attempt composition
→ classify using current project categories
→ prove candidate gap only if composition fails
→ identify affected canonical files
→ preserve unresolved gameplay
```

Do not patch unless the task asks for patching.

---


## Autonomous Character normalization loop

When the user authorizes Codex to continue Character work autonomously, use this default loop:

```text
1. choose/select Raw Kit
2. inspect current repository canon
3. create or update Clarified Gameplay Canon
4. self-audit the Clarified Canon
5. surface only genuinely blocking designer ambiguities
6. if sufficiently locked, normalize the Character against current 00–08
7. audit architecture impact across 00–08
8. attempt existing composition first
9. prove any generic gap
10. draft the smallest edits for only the affected canonical files
11. self-audit the draft before applying it
12. correct the draft
13. apply the corrected edits directly to the canonical repo files
14. inspect the resulting diff
15. run cross-file architecture consistency checks
16. update 08 only when new regression coverage is actually required
17. perform the mandatory six-pass final self-audit
18. report changed files and unresolved gameplay
```

Important:

```text
audit impact across 00–08
≠
modify all 00–08
```

Only files with a proven semantic delta should change.

Examples:

```text
02 may remain NO CHANGE
03 may remain NO CHANGE
07 may remain NO CHANGE
00 changes only when index/recovery/bookkeeping genuinely requires it
```

Do not create standalone patch artifacts unless the user asks for them.

When authorized for direct repository editing, the preferred workflow is:

```text
draft internally
→ self-audit
→ correct
→ edit canonical files directly
→ inspect diff
→ final audit
```

rather than:

```text
create detached patch file
→ leave canonical repo unchanged
```

If a gameplay ambiguity blocks a required semantic decision:

```text
do not invent it
ask the user
```

If the ambiguity is unrelated to the current architecture work:

```text
record UNRESOLVED
continue with the unblocked work
```


# 26. DESIGN MODE — PRESERVE CREATIVITY

When the user asks for new mechanics/Characters rather than normalization:

- do not optimize ideas around current architecture prematurely;
- do not reject unusual mechanics because they pressure the Kernel;
- explore distinctive mechanics freely;
- separate creative design from later feasibility;
- do not silently turn brainstorming into canon.

Architecture should adapt to locked design when justified.

Design should not be made boring merely to protect architecture.

---

# 27. BULK ROSTER WORKFLOW

Bulk automation is encouraged for:

- inventorying raw kits;
- drafting Clarified Gameplay Canons;
- detecting ambiguity;
- grouping Characters by architecture pressure;
- regression normalization after architecture stabilizes.

Do not let hundreds of Characters independently grow architecture in one pass.

Use representative Pilots/batches for architecture pressure testing.

When several Characters prove the same gap:

```text
converge on one reusable abstraction
```

not parallel subsystems.

---

# 28. ARCHITECTURE FILE WORKFLOW

Logical architecture ownership:

```text
00
→ canonical index / recovery / architecture bookkeeping

01
→ Terminology

02
→ Functional Tags

03
→ Primitive Registry

04
→ Ability Schema / authoring / normalized-plan surface

05
→ Contracts

06
→ Kernel Runtime

07
→ Mode Profiles

08
→ Stress Tests
```

Typical Pilot progression when changes are proven:

```text
01
→ 04
→ 05
→ 06
→ 07 only if mode-owned change is real
→ 08
```

This is a default, not a requirement that every Pilot changes every file.

`02` and `03` have especially high burden of proof.

Past `NO CHANGE` and `PATCH REQUIRED` conclusions are hypotheses until checked against current canon.

---

# 29. REPOSITORY EDIT WORKFLOW

Before editing a canonical file:

1. inspect latest actual merge base;
2. inspect directly relevant dependencies;
3. reconstruct required semantics independently;
4. attempt existing composition;
5. preserve merged prior-Pilot semantics unless explicitly superseded;
6. make the smallest correct change.

When editing directly:

- edit the actual canonical file;
- avoid creating competing `_FINAL`, `_MERGED`, `-1`, `-2` canonical copies;
- update index/references only when required;
- keep unrelated changes out of the diff;
- do not overwrite unrelated work;
- do not force-push or destructively reset unrelated work unless explicitly instructed.

If direct-main mutation was not requested, prefer a reviewable branch/PR for architecture changes.

Do not push/merge unless authorized.

---

# 30. PATCH ARTIFACT FORMAT — ONLY WHEN REQUESTED

When the user asks for a standalone patch artifact, make it self-contained.

Include for each patch:

```text
PATCH ID
target file
verified merge base
exact semantic-anchor location
INSERT / EXTEND / REPLACE
why current canon is insufficient
complete canonical text
migration / validation consequence
unresolved items
```

Use semantic anchors, not line numbers.

Separate merge instructions from canonical text.

Do not require manual reconciliation of old proposal + audit correction.

If editing the repository directly, do not generate redundant patch files unless asked.

---

# 31. DIRECT-EDIT EXECUTION

When authorized to modify the repository:

1. inspect current branch/ref and `git status`;
2. ensure the working base is appropriate;
3. inspect actual target files;
4. make only requested/proven edits;
5. run checks appropriate to the active Project Phase;
6. inspect the actual diff;
7. run the six-pass self-audit;
8. fix issues found;
9. rerun affected checks;
10. report changed files, checks, and unresolved items.

During `ARCHITECTURE PHASE`, step 5 normally means lightweight documentation/consistency checks, **not** `build.mjs` or executable runtime tests.

During `IMPLEMENTATION PHASE`, relevant builds/tests become normal validation requirements.

If a failure is unrelated and pre-existing:

```text
report it
do not silently redesign unrelated architecture
```

If unrelated changes conflict:

```text
do not discard them
reconcile only when intent is clear
otherwise stop and report
```

---

# 32. ADVERSARIAL AUDIT MODE

Audit is not ceremonial.

When auditing a proposal, merged diff, or your own previous work:

1. reconstruct required semantics from current repo + locked gameplay before defending the proposal;
2. independently attempt composition;
3. classify each relevant patch:

```text
ACCEPT AS-IS
ACCEPT WITH CORRECTION
REJECT / REDESIGN
```

4. audit negative space:

```text
zero result
no target
tie
failed payment
partial transaction
lifecycle invalidity
cleanup cause
transition failure
redeploy
repeated initialization
same root but child Action
multiple matching rules
snapshot/live-read drift
CC-lost opportunity
target invalid after lock
```

5. consolidate corrections into one final repo diff or one final artifact.

When practical, use a fresh Codex task/context for adversarial audit.

If the same task authors and audits:

```text
finish draft
→ reconstruct requirements again from source
→ assume draft may be wrong
→ audit
→ revise
```

Do not preserve wording merely because you wrote it.

---

# 33. MANDATORY SIX-PASS FINAL SELF-AUDIT

Before calling substantial architecture/canon work final or merge-ready, run all six passes.

## Pass 1 — Semantic fidelity

Verify:

```text
meaning
thresholds/formulas
owner/source/recipient
target relation
timing checkpoint
snapshot/re-query
clock
lifetime
failure
transition cause
```

## Pass 2 — Independent composition

Ask again:

```text
Can current architecture already express this?
Did a proposal bias the gap conclusion?
Can a smaller typed extension solve it?
Are new Tags/Primitives genuinely necessary?
```

## Pass 3 — Layer / namespace / lifetime

Verify:

```text
correct file/layer
correct ID namespace
no alias/collision
state owner/key/lifetime
correct persistence/retention scope
```

## Pass 4 — Determinism / negative space

Attack with:

```text
tied targets
list-order dependence
multiple matching rules
zero actual result
failed Cost
partial commit
invalid locked target
child Action sharing root
CC-lost opportunity
cleanup vs expiry
redeploy/reinitialize
repeated static registration
same-window unrelated candidates
```

Ask:

> What would a buggy but superficially plausible Kernel do?

If multiple incompatible outcomes remain legal:

```text
fix the Contract
or
mark REQUIRED_EXPLICIT / unresolved
```

## Pass 5 — Prompt / source contradiction

Verify:

```text
current user scope followed
later designer correction beats older wording
current repo beats stale proposal/snapshot
unresolved gameplay not silently chosen
AGENTS.md did not overconstrain the task
unrelated improvements not smuggled into scope
```

## Pass 6 — Mergeability

Verify:

```text
latest actual target base read
edits/anchors correct
prior Pilot semantics preserved
no duplicate abstraction
migration impact understood
relevant stress coverage present or scheduled
diff and phase-appropriate checks inspected; executable build/tests only when applicable to the active Project Phase
final artifact/diff self-contained
```

If any pass fails or remains uncertain:

```text
revise
rerun affected checks
do not call the result final
```

---

# 34. STRESS-TEST DOCTRINE

Stress tests prove architecture, not only arithmetic.

During `ARCHITECTURE PHASE`, `08_STRESS_TESTS.md` is a declarative architecture validation suite. Editing it does not require implementing or executing game/runtime tests unless the user explicitly requests implementation validation.

Prefer tests for:

- transaction boundaries;
- snapshot timing;
- target locks/ties;
- failure propagation;
- lifecycle invalidity;
- terminal causes;
- recursion prevention;
- multi-owner atomic transitions;
- replay determinism;
- hidden-order resistance;
- prior-Pilot regression.

Preserve current intent classes such as:

```text
MUST_PASS
MUST_REJECT
PROBE_UNRESOLVED
```

Do not convert an unresolved global question into a passing default.

---

# 35. REPOSITORY HYGIENE

Avoid competing canonical copies such as:

```text
*_MERGED.md
*_FINAL.md
*-1.md
*-2.md
phone-local canonical copies
chat-exported canonical copies
```

unless the repository intentionally uses them and the canonical index identifies them.

If canonical filenames are normalized:

- update the canonical index;
- update internal references;
- preserve semantic content;
- treat canonical ID renames as migrations, not cosmetic cleanup.

Do not infer currentness from filename suffix alone.

---

# 36. OUTPUT DISCIPLINE

## Design / clarification

- preserve designer intent;
- surface real ambiguity;
- do not patch architecture prematurely.

## Character normalization

- map mechanics to exact current architecture;
- distinguish composition from proven gap;
- identify affected canonical files;
- preserve real unresolved items.

## Direct repo editing

- do the work in repo;
- summarize changed files;
- report checks/tests;
- report blockers/unresolved;
- do not generate redundant patch artifacts unless asked.

## Audit

A strong audit result may be:

```text
NO CHANGE
```

Do not invent work merely to appear productive.

---

# 37. FINAL CHECKSUM

Before final response, every applicable statement must be true.

```text
I used the repository as the project source of truth.

I distinguished merged canon from proposed/working-branch delta.

I audited this AGENTS.md for stale or overconstraining content.

I followed the user's immediate scope.

I gave later explicit designer corrections precedence for gameplay meaning.

I did not treat old proposals/handoffs as canon.

I attempted composition before accepting architecture growth.

I did not create a Tag from a parameter/timing noun.

I did not create a Primitive for orchestration already covered by atomic operations.

I preserved Action lineage vs Effect provenance vs Damage Attribution.

I preserved Natural Action opportunity vs actual Action completion.

I preserved HP Cost vs HP Loss vs Damage.

I preserved Base Deployment Cost vs Current Deployment Cost vs Deployment Cost Bar.

I preserved LEAVE_FIELD vs RETURN_TO_DECK.

I preserved lifecycle terminal cause.

I did not model transition retention as Cleanse unless gameplay says Cleanse.

I did not turn trace/list/entity/Slot order into gameplay priority.

I did not mark partial Cost work terminal early.

I did not turn one Character's local rule into a global default.

I can identify owner/key/lifetime for new mutable state.

I can identify authoritative commit boundaries for multi-owner transitions.

I verified canonical-looking symbols in their actual namespaces.

I preserved intentional unresolved gameplay.

I preserved already-merged prior-Pilot semantics unless explicitly superseded.

I ran the six-pass self-audit before calling substantial work final.

I respected the active Project Phase.

During ARCHITECTURE PHASE, I did not run implementation builds/tests or modify executable code unless explicitly required.

If I edited the repo, I inspected the actual diff and phase-appropriate validation output.
```

If any applicable statement is false or uncertain:

> continue auditing before finalizing.

---


# 37A. CURRENT PROJECT TARGET

While `ARCHITECTURE PHASE` remains active, optimize work toward:

```text
00–08 becoming sufficiently complete, internally consistent,
and expressive enough that diverse Character kits can be normalized
by generic composition rather than Character-specific hardcoding.
```

The objective is not to make the current implementation code appear finished.

Prefer discovering semantic weaknesses now, while architecture is still cheap to change.

Do not use old runtime code as the authority for what the architecture is allowed to mean.

A representative Pilot may prove:

```text
NO CHANGE
```

for most canonical files.

That is a valid result.

Architecture maturity is demonstrated by increasing reuse and decreasing need for new abstractions across diverse kits, not by the number of files modified.

---

# 38. FINAL DIRECTIVE

This file tells Codex **how to think and work**.

It does not tell Codex what the current game contains.

Always derive current work from:

```text
latest repository canon
+ latest locked gameplay
+ relevant approved unmerged delta
+ immediate user scope
+ this reasoning doctrine
→ independent composition attempt
→ smallest correct change
→ adversarial audit
→ tested merge-safe result
```

Never invert it into:

```text
old proposal
or old chat memory
or old handoff snapshot
→ rationalize
→ force current repository to fit
```

The strongest architecture result may be:

```text
NO CHANGE
```

The next strongest may be:

```text
one typed field
+ one Contract rule
```

instead of a new subsystem.

The doctrine succeeds only if Codex can reject its own earlier solution when current evidence proves it wrong.

---

# 39. NEW-CHAT BOOTSTRAP AND DURABLE WORK CONTINUITY

This operational addendum complements the preceding rules. It records workflow and standing user authorization, not a roster snapshot, gameplay default, or change of Project Phase. Immediate user scope and the authority rules in sections 2–4 still govern.

## 39.1 Find and verify the actual repository

Repository: `Hungngo-creator/arclune_lane_7x3` on GitHub.

An empty local workspace or an unavailable repository/environment selector does not prove GitHub is inaccessible. Inspect available repository connectors as well as local Git access before reporting an access blocker. Use an available authorized route; do not assume a new chat has the same tools or credentials as an old one.

At task start, verify the canonical branch/ref, actual current commit, working-tree changes, and any relevant open PR. Read this root `AGENTS.md` first. Never use a screenshot or a previous chat's claim that a merge succeeded as verification.

Navigation anchors, subject to verification in the current tree:

- Raw kits: root `ý tưởng nhân vật 1.md`, `ý tưởng nhân vật 2.md`, `ý tưởng nhân vật 3.md`, and `Ý tưởng nhân vật 4.md`.
- Character Canons: `docs/canon kit/`.
- Architecture: `docs/Chuẩn hoá và gắn tag kit/`; start from `00_CANONICAL_INDEX.md` to resolve the active `00–08` filenames.

Preserve actual case, accents, spaces, and indexed filenames. Do not rename an indexed file merely because its suffix resembles a duplicate. Do not preload every Character Canon; load only what the task, composition proof, or regression obligations require.

## 39.2 Recover the task, not a presumed next Character

A new chat is not itself authorization to select a Character or resume an arbitrary old PR. An explanation-only request does not authorize starting another Character. Autonomous selection follows section 25 only within an authorized continuation task.

When selecting a raw kit, require a Passive, at least one Skill, and an Ultimate. One, two, or three Skills can all constitute a complete kit; judge coherence rather than imposing a fixed Skill count. Missing metadata is not automatically blocking: identify whether the current task actually depends on it.

Raw item numbers may collide. Identify an entry by file, Character name when available, and distinctive kit text, not its number alone. If those anchors cannot establish which kit the user means, ask. When the user explicitly supplies a replacement raw description or names, update that identified entry as requested before deriving its Canon; preserve unrelated entries.

## 39.3 Make approved decisions recoverable without chat memory

During authorized Character work, incorporate explicit designer answers and later corrections into the relevant Clarified Gameplay Canon. Preserve their scope, formulas, checkpoints, failure semantics, and which older wording they supersede. An approval such as "all other proposed answers are approved" must be resolved into concrete semantics from an actually available proposal; never reconstruct missing answers from memory.

Before asking a gameplay question, check the active Canon and relevant current sources for an existing lock. If incompatible interpretations affect gameplay and the sources cannot prove a choice, ask about the genuinely blocked decision. Record unrelated ambiguity as `UNRESOLVED / NOT BLOCKING` and continue independent work. Distinguish future external-content or Mode boundaries from missing internal kit decisions; mark a boundary non-blocking only when the current task does not depend on it.

Do not use this `AGENTS.md` to store Character mechanics, current Pilot versions, per-kit patch conclusions, or a fixed implementation folder layout. For each proposed Kernel change, make the proof explicit:

```text
current Schema input
→ governing Contract
→ current runtime owner
→ exact insufficiency
→ smallest runtime extension
```

## 39.4 Standing authorization and verified delivery

The user has authorized Codex to commit completed, in-scope repository patches, create a reviewable PR, and merge them autonomously after the required audits and phase-appropriate checks, without another user approval request. This is the authorization required by section 29; it applies when the task authorizes repository editing. It does not widen an audit-only, discussion-only, normalization-only, or explicitly restricted task, and later user instructions can narrow or revoke it.

Before merging, inspect the actual PR diff, verify its head commit and changed-file scope, and recheck the target branch. If the target moved, reconcile and audit the resulting delta before merging. Do not merge unrelated PRs, overwrite unrelated work, force-push, or bypass repository protection under this authorization. If access or repository requirements prevent delivery, report the concrete blocker rather than claiming completion.

After merging, verify the PR is merged and the resulting canonical branch contains the intended content. Report the PR/commit, changed files or sections, checks, and genuine unresolved items. If work must pause, keep a concise recoverable status in the task report or existing PR: verified base, proposed changes, checks completed, and exact blocked questions. Do not create a competing canonical handoff file or require a new chat to read the entire old conversation.
