# ARCLUNE — MODE PROFILES
## Chặng H — Mode-Specific Runtime Profiles
**Version:** 2026-09-10-H  
**Status:** Working Canonical Candidate  
**Depends on:** `01_TERMINOLOGY_vNext.md`, `02_TAG_vNext.md`, `03_PRIMITIVE.md`, `04_ABILITY_SCHEMA.md`, `05_CONTRACTS.md`, `06_KERNEL_RUNTIME.md`  
**Purpose:** define which runtime rules are active in each game mode without forking Character identity, Tag semantics, Primitive meanings, or Kernel foundations.

---

# 0. MODE PROFILE PRINCIPLE

A Mode Profile is a structured set of runtime policies.

It answers:

> **“Trong mode này, cùng một Character/Ability semantic sẽ được phép dùng những hệ thống nào, scheduling nào, resource nào, spatial model nào và lifecycle nào?”**

Mode Profile does **not** redefine the meaning of:

- DAMAGE;
- HEAL;
- SHIELD;
- TRUE_DAMAGE;
- REVIVE;
- REINCARNATION;
- ACTION;
- CHARACTER;
- PRIMITIVE;
- AUTHORITY.

Instead, it controls:
- whether a subsystem is enabled;
- which scheduler is used;
- which Character Ability profile is bound;
- which lifecycle model is active;
- which resource ownership policy applies;
- which spatial adapter applies;
- which target/area adapter applies;
- which Contract profile applies.

Canonical principle:

> **Mode khác nhau có thể dùng cùng semantic nhưng không cần dùng cùng runtime policy.**

---

# 1. MODE PROFILE ARCHITECTURE

Conceptual structure:

```yaml
modeProfile:
  modeId:
  schedulingProfile:
  spatialProfile:
  lifecycleProfile:
  resourceProfile:
  abilityProfile:
  targetingProfile:
  combatInstanceProfile:
  authorityProfile:
  historyProfile:
  narrativeProfile:
  settlementProfile:
  validationRules:
```

Not every mode uses every field.

---

# 2. CURRENT CANONICAL MODES / PROFILES

Current architecture requires at least:

```text
TURN_BASED_MAIN
ARENA_SUBCOMBAT
EXPLORATION_DEFENSE
```

Important:

`ARENA_SUBCOMBAT` is not necessarily a separate top-level game mode.

It is a specialized Combat Instance profile that can be created inside a parent mode.

---

# 3. SHARED GLOBAL LAYERS

The following remain global/canonical and are not duplicated per mode:

- Terminology;
- Canonical Functional Tags;
- Primitive semantics;
- Character Definition identity;
- Rank;
- Class;
- Element identity;
- True Self identity;
- Authority Tier meanings;
- Capability Index model;
- Execution Trace model.

A mode may disable use of a system without redefining it.

Example:

> Exploration/Defense currently disables Luân Hồi.

That does not mean `REINCARNATION` has a different semantic there.

It means:
> the mode lifecycle profile does not activate that subsystem.

---

# 4. MODE-SPECIFIC ABILITY BINDING

One Character Definition may bind different Ability profiles per mode.

Conceptual:

```yaml
character:
  characterId: X

  modeProfiles:
    TURN_BASED_MAIN:
      abilitySet: FULL_TURN_BASED_KIT

    EXPLORATION_DEFENSE:
      abilitySet: EXPEDITION_SIMPLIFIED_KIT
```

This avoids creating:
- duplicate Character identities;
- duplicate roster entries;
- mode-specific Tag variants.

---

# 5. MODE PROFILE RESOLUTION

At Combat Instance creation:

```text
modeId
→ resolve Mode Profile
→ bind scheduler
→ bind spatial adapter
→ bind lifecycle profile
→ bind resource profile
→ bind Character ability variants
→ bind target/area contracts
→ create Combat Instance
```

Runtime does not ask each Ability:
> “Am I in turn-based?”

Mode Profile already provides the normalized context.

---

# 6. TURN-BASED MAIN PROFILE

## Mode ID

```text
TURN_BASED_MAIN
```

## Status
`LOCKED CURRENT CORE`

This is the current canonical combat mode using SSI.

---

# 7. TURN-BASED SCHEDULING

Turn-based scheduling uses:

```text
SSI
Natural Action Opportunity
Natural Pointer per Side
Turn Boundary
Actor Natural Action Window
Slot Clock where specific mechanics require it
```

Canonical flow:

```text
Side A eligible Natural Action
→ Turn Boundary
→ Side B eligible Natural Action
→ Turn Boundary
→ Side A next eligible Natural Action
→ ...
```

---

# 8. TURN-BASED BATTLEFIELD

Current battlefield concept:

```text
3 allied columns
1 middle/intersection column
3 enemy columns
```

Each side has approximately:
- 9 normal combat positions;
- Leader as its own combat unit/role.

Exact visual presentation can evolve independently.

# 8A. TURN-BASED DECK DEPLOYMENT

`TURN_BASED_MAIN` supports roster Character deployment:
eligible Deck-member Character
→ successful Deployment transaction
→ Battlefield active presence
Deck membership means the Character belongs to the battle roster/Deck.
It does not by itself mean:
currently waiting undeployed;
currently deployable;
currently absent from Battlefield.
Current deployment state must separately permit the Deploy transaction.
A Deck-member roster Character is not automatically SUMMON.
Successful Deck deployment follows DEP-*.
For TURN_BASED_MAIN, the global Deck-deployment rule applies:
successful DEPLOY_FROM_DECK
→ Current Rage = Max Rage
Full Rage:
establishes Rage readiness;
does not auto-cast Ultimate.
After deployment, Natural Action eligibility remains governed by current SSI pointer/pass state.
A Character does not receive an immediate extra Natural Action merely because deployment succeeded.
Character Deployment Cost is read from Character deployment metadata.
During Pilot authoring it may be:
TBD_BY_COST_BUDGET
but runtime payment requires a resolved numeric value.

---

# 9. TURN-BASED LEADER

Leader:
- has HP;
- can participate as combat unit;
- can act according to its profile;
- true/confirmed Leader death ends battle under battle-end Contract.

Leader death checks:
> `DEATH_CONFIRMED`, not HP_ZERO.

---

# 10. TURN-BASED LIFECYCLE

Turn-based Main enables:

```text
HP_ZERO
Death Prevention
DEATH_CONFIRMED
Revive
True Self
Luân Hồi Waiting
Reincarnation
Rebirth / route systems
```

Summons without Chân Ngã remain outside ordinary Luân Hồi counting by default.

---

# 11. TURN-BASED LUÂN HỒI

Current standard:

```text
waiting threshold = 4 later qualifying deaths
```

Death Cohort semantics:
- same simultaneous cohort members do not count one another;
- earlier waiting True Selves advance by the number of qualifying deaths in later cohort.

World Axiom bookkeeping executes before ordinary queued Revive.

---

# 12. TURN-BASED RESOURCE PROFILE

Current default:

```text
AE:
  ownership = SIDE/TEAM

RAGE:
  ownership = ACTOR
```

Specific kit can:
- gain;
- drain;
- set;
- consume;
under Cost/Resource Contracts.

Turn-based deployment uses a third independent resource system:
DEPLOYMENT COST BAR:
  ownership = deployment system associated with Side/player
  purpose = Deck → Battlefield Character deployment
  gainRate = +1 Cost per 1 second
Canonical separation:
Deployment Cost Bar
≠ AE
≠ Rage
Deployment Cost Bar does not pay ordinary Ability Cost.
AE does not pay ordinary Deployment Cost.
Rage does not pay ordinary Deployment Cost.
The exact +1 Cost per 1 second rate belongs to this TURN_BASED_MAIN Mode Resource Profile and is not a universal cross-mode resource rule.
This Mode Profile patch does not define:
Cost Bar maximum;
overflow behavior;
pause behavior;
time-scale interaction;
background/offline accumulation.

## 12.1 AE ACTION REGEN BY EFFECTIVE CLASS

`TURN_BASED_MAIN` grants Side/team AE after a Character **actually completes one of its own Natural Actions**.

Canonical table:

| Effective Class | AE gained |
|---|---:|
| Support | 10 |
| Mage | 7 |
| Summoner | 7 |
| Warrior | 5 |
| Tanker | 5 |
| Ranger | 5 |
| Assassin | 3 |

Lookup uses the Actor's `EFFECTIVE_CLASS` at the Natural Action completion point.

The Ability form used for that Natural Action does not change this table.

Therefore:
Natural Basic Attack completed
Natural Skill completed
Natural Ultimate completed
all grant the same Class-defined amount.
Qualification
AE regeneration requires:
naturalActionStatus = NATURAL
AND
ACTION_COMPLETED actually occurred
A consumed SSI opportunity with no performed Action does not qualify.
Therefore:
CC causes Actor to lose Natural Action opportunity
→ no Action performed
→ no class AE regen
The following do not qualify merely because they execute successfully:
Follow-up
Counter
Reaction
Forced Action
child Action
other NON_NATURAL Action
Timing
Class AE regeneration is a Mode Profile post-Natural-Action system hook:
root Natural Action
→ all root-linked blocking settlements finish
→ ACTION_COMPLETED
→ AE_ACTION_REGEN_BY_CLASS
→ SSI pointer advance / Turn Boundary
Therefore AE gained from this Natural Action is not available to pay a blocking settlement belonging to that same Action before completion.
Ownership
The gained AE is credited to:
the Actor's Side/team AE pool
under the Turn-based resource ownership rule.
System provenance
This gain is a Mode/System resource grant.
It is not:
a Character Ability;
a Functional Tag;
a child Action;
a Triggered Skill.
Execution Trace should identify the gain source as the Turn-based Mode Resource Profile.

---

# 13. TURN-BASED ABILITY PROFILE

Full Character kit may include:

- Passive;
- Basic Attack;
- Skill;
- Ultimate;
- Follow-up;
- Counter;
- Forced Action;
- Reaction;
- child Action;
- Authority rules;
- lifecycle rules;
- Reincarnation;
- complex persistent State.

No requirement exists that every Character use every category.

# 13A. TURN-BASED NATURAL ACTION FORM PRIORITY

`FULL_RAGE` and `AUTO_CAST_ULTIMATE` remain separate semantics.

Receiving or reaching full Rage does not immediately create/cast an Ultimate Action.

However, when an Actor's actual Natural Action arrives, `TURN_BASED_MAIN` uses the following default Action-form priority unless an explicit Character/System Action-form restriction overrides it:

if Current Rage >= Max Rage
AND Ultimate is legal
→ select Ultimate

otherwise
→ continue ordinary legal Action selection
Therefore:
DEPLOY_FROM_DECK
→ Current Rage = Max Rage
does not cast Ultimate at deployment time.
Instead:
later actual Natural Action
→ Mode default Action-form policy sees Rage readiness
→ legal Ultimate receives automatic priority
Explicit restriction overrides Mode default
A Character/System naturalActionFormPolicy may constrain that Natural Action before the Mode default is used.
Example:
Echo memory = SKILL
Echo Current Rage = Max Rage
If Echo's active restriction permits only:
SKILL
→ BASIC fallback
then full Rage does not bypass the restriction.
If memory declares:
ULTIMATE
→ remembered child SKILL
→ BASIC
the generic ordered fallback resolver evaluates that authored sequence.
No extra Natural Action
Automatic Ultimate priority:
does not create another Natural Action;
does not cast outside SSI;
does not advance SSI twice.
The selected Ultimate is the Actor's existing SSI-granted Natural Action.
Legality remains authoritative
Rage readiness alone does not override:
Character/System Action-form restriction;
target/prerequisite illegality;
Mode restriction;
cooldown/disable;
Authority/rule prohibition.
Canonical distinction remains:
FULL_RAGE
≠ unconditional Ultimate success
≠ immediate auto-cast event

---

# 14. TURN-BASED TARGETING

Targeting uses:
- discrete slots;
- Side relation;
- Candidate Pool;
- direct Target Selection;
- fixed geometry;
- random selection;
- Position Mark;
- Battlefield Field.

Target Exclusion and Area Resolution remain distinct.

---

# 15. TURN-BASED POSITION MODEL

Position mutation can include:

- swap;
- push;
- pull;
- teleport;
- forced relocation;
- slot replacement;
- return.

Moving into a passed slot does not grant a second Natural Action in same Side pass.

Turn-based Slot geometry supports `SpatialSelectorSpec` with Side-relative orientation.

Canonical mapping semantics:
FRONT = toward opposing Side
BACK  = toward own rear line
LEFT  = left relative to reference Side facing
RIGHT = right relative to reference Side facing
The selector's declared orientation anchor determines the reference Side.
Opposing Sides use mirrored facing/orientation.
Therefore the same authored priority:
BACK
→ LEFT
→ RIGHT
must resolve correctly for either Side without hardcoding one global screen direction.
Exact Slot IDs remain Mode spatial data and are not part of Character Ability semantics.

---

# 16. TURN-BASED SUMMON PROFILE

A Summon eligible for Natural Actions:

- enters a battlefield slot;
- if pointer has not passed that slot, may act this pass;
- if pointer has passed, waits next pass.

Summon behavior does not redefine Character True Self semantics.

---

# 17. TURN-BASED PUPPET PROFILE

Puppet is a distinct entity kind.

Turn-based Pygmalion rules include:

- one new Puppet per Pygmalion Life Cycle;
- old Puppets persist independently;
- multiple Puppets can coexist;
- one True Self per Puppet;
- Puppet inherits Combat Definition Class;
- Puppet does not inherit Element automatically;
- Puppet is not automatically Summon;
- inhabited Puppet can ordinary-Revive same Puppet-life before True Self enters Reincarnation.

---

# 18. TURN-BASED AUTHORITY PROFILE

Turn-based enables full Authority system:

```text
Axiom
> Quy Tắc
> Pháp Tắc
> Normal
```

Direct conflict only.

Different special tiers:
> higher tier wins conflict.

Same special tier:
> Authority Adjudication using Rank → Tu vi → Stars → Awaken → CP.

Normal effects do not automatically use progression adjudication.

---

# 19. TURN-BASED HISTORY PROFILE

Quang Ảnh Chi Hà can record:
> one historical snapshot after each complete Action.

This is independent of animation.

Exact time-regression semantics remain Contract-heavy.

---

# 20. TURN-BASED NARRATIVE PROFILE

Narrative System can operate in turn-based Combat Instance.

It may use:
- Story;
- Container;
- Bearer;
- Witness;
- Belief;
- Stability;
- Proof;
- Counter-Proof;
- Realization;
- Property transfer.

Narrative cadence must use an explicit clock.

Legacy ambiguous “Turn Boundary of owner” wording is not automatically accepted.

---

# 21. ARENA SUBCOMBAT PROFILE

## Profile ID

```text
ARENA_SUBCOMBAT
```

## Status
`LOCKED SYSTEM PROFILE`

Arena is an isolated Combat Instance created by an Ability/System.

It is not:
- a Field;
- a visual cutscene;
- a completely independent world.

---

# 22. ARENA PARENT RELATION

Arena stores:

```text
parentCombatInstanceId
arenaOwner/source
participantRefs
returnPolicies
localObjects
localStates
```

Participants retain their relevant identities.

---

# 23. ARENA PARTICIPANT TRANSFER

Transfer:

```text
parent instance active presence
→ Arena active presence
```

does not:
- DEATH_CONFIRMED;
- create new True Self;
- automatically reset lifeSerial.

Arena participant transfer is not `DEPLOY_FROM_DECK`.

Main → Arena transfer can produce:

LEAVE_FIELD(Main)
ENTER_FIELD(Arena)
Arena → Main return can produce:
LEAVE_FIELD(Arena)
ENTER_FIELD(Main)
These are Combat-Instance-local Field Presence transitions.
They do not apply:
Current Rage = Max Rage
from the global Deck-deployment rule.
Any Rage mutation caused by Arena transfer or Arena return requires its own explicit mechanic.
Therefore:
ENTER_FIELD caused by Arena transfer/return does not imply Deck Deployment.

---

# 24. ARENA SCHEDULING

Arena can bind a scheduling profile distinct from parent instance.

Current architecture does not require:
- same SSI pointer;
- same current Side position;
- same slot map.

Exact Arena scheduler can be character/system-specific if needed, but should be a reusable Arena Contract, not Character hardcode.

Arena participant transfer is not `DEPLOY_FROM_DECK`.

Main → Arena transfer can produce:
LEAVE_FIELD(Main)
ENTER_FIELD(Arena)
Arena → Main return can produce:
LEAVE_FIELD(Arena)
ENTER_FIELD(Main)
These are Combat-Instance-local Field Presence transitions.
They do not apply:
Current Rage = Max Rage
from the global Deck-deployment rule.
Any Rage mutation caused by Arena transfer or Arena return requires its own explicit mechanic.
Therefore:
ENTER_FIELD caused by Arena transfer/return does not imply Deck Deployment.

Điều này đúng với Ariadne: vào Arena và quay Main đều tạo entry semantics nhưng không tự nhận full Rage.

---

# 25. ARENA LIFECYCLE

True death inside Arena can still be observed by global/world lifecycle systems.

In particular:
> Luân Hồi can observe qualifying DEATH_CONFIRMED in Arena.

Arena does not create “fake death” ontology merely to isolate duel presentation.

---

# 26. ARENA OBJECT OWNERSHIP

Objects created in Arena belong to Arena instance by default.

When Arena closes:

- local Field;
- Cocoon;
- Mark;
- Container;
- special object;

does not automatically transfer to parent battlefield.

Explicit transfer is required.

---

# 27. ARENA RETURN

Arena must eventually define:

- return Position;
- full parent battlefield behavior;
- dead participant behavior;
- pending life-state behavior;
- object cleanup.

Current global architecture intentionally leaves exact fallback profile unresolved.

---

# 28. EXPLORATION / DEFENSE PROFILE

## Mode ID

```text
EXPLORATION_DEFENSE
```

## Status
`LOCKED HIGH-LEVEL DIRECTION / MANY LOCAL CONTRACTS UNRESOLVED`

This is the current Khai Hoang / dungeon expedition-defense hybrid.

It is not a turn-based variant.

---

# 29. EXPLORATION CORE FANTASY

At account/meta progression:

- player establishes a Tông Môn;
- Tông Chủ dispatches an NPC to khai hoang;
- player directly controls that dispatched NPC;
- that NPC leads recruited roster Characters through unknown Rooms;
- player gathers local resources;
- fights;
- builds structures;
- defends cleared territory;
- finds extraction;
- moves/transports Base to extraction;
- stage settles.

---

# 30. EXPLORATION PLAYER AVATAR

The directly controlled expedition NPC is:

```text
EXPLORER_NPC
```

It is not automatically:
- the player's main story Character;
- a gacha roster Character;
- a turn-based Leader.

---

# 31. EXPLORATION ROOM MODEL

Stage contains many Rooms.

Room:
- large spatial region;
- can be unknown;
- can become cleared;
- can be occupied;
- can contain resources;
- can contain structures;
- can respawn monsters if left empty for a sufficient period according to future Contract.

Room is not turn-based Slot.

---

# 32. ROOM SCALE

Current direction:

- one Room is large;
- minimum visual scale around half a phone screen;
- combat units appear small relative to Room;
- visual analogy: players on a football pitch.

This is presentation/spatial design direction, not exact coordinate scale.

---

# 33. EXPLORATION CAMERA

Current direction:
- angled/isometric-ish 3D presentation;
- intended to permit partial reuse of angled combat assets with turn-based presentation.

Camera is not gameplay semantic.

---

# 34. EXPLORATION SCHEDULING

This mode does **not** use SSI.

It should use a real-time/spatial scheduler compatible with:

- movement speed;
- attack speed;
- active skill cadence;
- multiple enemies;
- structures;
- projectiles/area effects;
- room events.

Exact scheduler remains unresolved.

---

# 35. EXPLORATION LIFECYCLE

Current explicit rule:

> **No Luân Hồi in this mode.**

Therefore lifecycle profile disables:
- Reincarnation Waiting;
- Reincarnation routing;
- death-order ledger.

It may still use:
- HP;
- death;
- removal;
- revive if a future mode-specific ability explicitly supports it;
but current exact death/revive design remains unresolved.

---

# 36. EXPLORATION KIT SIMPLIFICATION

User direction:

> mode này không dùng full turn-based kit.

Current wording indicates a simplified kit approximately containing:
- Normal Attack;
- a Passive-like component;
- a damaging/active Skill;
- Ultimate.

The exact slot taxonomy is **not fully canonical** because prior wording included:
> “không có nội tại, chỉ có đánh thường, skill bị động và gây damage cũng ultimate”

which is semantically ambiguous.

Do not freeze a four-slot nomenclature until user finalizes it.

---

# 37. EXPLORATION ABILITY PROFILE

Mode binding should provide an explicit simplified Ability set.

Example concept:

```yaml
TURN_BASED_MAIN:
  abilities:
    - PASSIVE_1
    - BASIC_ATTACK
    - SKILL_1
    - SKILL_2
    - ULTIMATE

EXPLORATION_DEFENSE:
  abilities:
    - NORMAL_ATTACK
    - PASSIVE_PROFILE_X
    - ACTIVE_DAMAGE_SKILL
    - ULTIMATE_PROFILE_X
```

This is illustration only.

---

# 38. EXPLORATION RAGE

Current rule:

> retain Rage.

Rage remains actor-oriented unless mode later changes it.

Ultimate can use Rage according to mode-specific Ability profile.

---

# 39. EXPLORATION AE

Current rule:

> actions can generate AE.

Exact AE ownership remains unresolved:

Possible:
- per actor;
- expedition team shared pool;
- local squad pool;
- Base-linked pool.

Do not inherit turn-based team AE automatically.

---

# 40. EXPLORATION MOVEMENT SPEED

`MOVEMENT_SPEED` is a real mode stat.

It affects spatial movement.

It is not:
- SSI speed;
- turn order;
- Natural Action frequency.

---

# 41. EXPLORATION ATTACK SPEED

`ATTACK_SPEED` affects attack cadence in real-time/spatial scheduling.

It must not be interpreted as:
> extra Natural Actions.

There are no SSI Natural Actions in this mode.

---

# 42. EXPLORATION WEIGHT

`WEIGHT` is a physical/gameplay property.

Current user direction:
> weight matters because some gravity-related structures/mechanics depend on it.

Exact formulas remain open.

---

# 43. EXPLORATION TARGETING

Targeting can use:
- spatial radius;
- nearest;
- line;
- cone;
- projectile trajectory;
- structure target;
- Room-local targeting.

The canonical TargetSpec system remains reusable.

Spatial adapter interprets geometry differently from slot-based turn combat.

---

# 44. EXPLORATION POSITION

Position is continuous/spatial rather than discrete turn-based slots.

Kernel should abstract:

```text
PositionRef
SpatialQuery
AreaGeometry
```

so primitives such as:
- MUTATE_POSITION;
- RESOLVE_AREA;
can work through different adapters.

---

# 45. EXPLORATION COMBAT INSTANCE

A Room fight can exist inside one broader stage runtime.

Possible runtime organizations:

```text
one stage-wide Combat Instance
```

or:

```text
Room-local encounter instances
```

or a hybrid.

This is currently unresolved.

Do not overfreeze Combat Instance granularity before real prototype tests.

---

# 46. EXPLORATION MONSTER SPAWN

Current design:
- unknown Rooms may contain monsters;
- cleared Rooms left empty for enough time can spawn monsters.

Still unresolved:
- exact timer;
- spawn conditions;
- whether structure presence prevents spawn;
- whether player Character presence alone counts as occupied;
- spawn budget.

---

# 47. EXPANSION PRESSURE

Exploring more Rooms:
- yields resources;
- increases territory;
- creates greater defense burden.

This is intentional macro gameplay tension.

It should not be normalized away into linear dungeon progression.

---

# 48. LOCAL RESOURCE SYSTEM

Mode currently has at least:

> ~15 local resource types planned.

Exact list and recipes are unresolved.

Local resources:
- exist within the mode/stage economy;
- are used for structures and conversion;
- do not directly become global currency unless converted/settled through Base system.

---

# 49. STRUCTURES

Current design plans:
> at least ~10 structure/tower types.

Structures cost combinations of local resources.

Potential categories:
- defense;
- utility;
- resource conversion;
- gravity/weight interaction;
- Base support.

Exact list is not canonical yet.

---

# 50. OLD MODE MIGRATION

The older Kingdom-like mode is being deleted.

Its:
- resources;
- monsters;
- architectures;
- runes;

can migrate into Exploration/Defense.

Do not preserve old mode runtime just to preserve old content.

Content may be re-homed into new Mode Profile.

---

# 51. BASE

Base is stage objective + economic core.

Current role:
- holds/converts resources;
- stores Energy;
- eventually must reach extraction point;
- settlement uses Energy currently stored in Base.

Exact Base movement mechanics remain unresolved.

---

# 52. BASE MOVEMENT

Do not assume:
- player carries Base;
- Base moves on rails;
- Base is teleported;
- Base is a vehicle.

The user has not defined this yet.

Mode Profile exposes a placeholder:

```text
baseTransportProfile = UNRESOLVED
```

---

# 53. ENERGY

Base converts heterogeneous local resources into one mode-local unified value:

```text
ENERGY
```

Energy is not global currency.

---

# 54. LOCAL RESOURCE → ENERGY

Current direction:

```text
local resources
→ conversion
→ Base Energy
```

Exact conversion rates unresolved.

---

# 55. ENERGY → LOCAL RESOURCE

Reverse conversion is allowed with inefficiency/loss.

Canonical principle:

```text
Energy → local resources
```

has a worse exchange than forward conversion.

Exact loss formula unresolved.

---

# 56. SETTLEMENT

At stage completion:

```text
SettlementValue
= BaseStoredEnergy
× SettlementRatio
```

Current rule:
- only Energy currently in Base counts;
- unconverted local resources are ignored.

This is locked current direction.

---

# 57. SETTLEMENT RATIO

Default:

```text
no Rune = 1.0
```

Runes can modify:
- difficulty;
- reward;
- settlement ratio.

Current user explicitly stated:
> using Runes can increase settlement ratio/reward.

Exact easier-Rune behavior remains unresolved.

---

# 58. GLOBAL CURRENCY OUTPUT

Settlement converts into global currency hierarchy.

Current named currencies:

```text
Vụn Nguyên Tinh
Hạ Nguyên Tinh
Trung Nguyên Tinh
Thượng Nguyên Tinh
Thần Tinh
```

Exact conversion thresholds/rates unresolved.

---

# 59. LOCAL VS GLOBAL ECONOMY

Canonical distinction:

```text
Local Resource
≠ Base Energy
≠ Global Currency
```

Local Resource:
- stage/mode operations.

Energy:
- unified local settlement intermediate.

Global Currency:
- account-wide value across modes.

---

# 60. RUNES

Rune is a stage modifier profile.

It can affect:
- challenge;
- enemy properties;
- resource pressure;
- settlement ratio;
- other stage constraints.

Rune should be declarative data, not code.

---

# 61. MODE PROFILE FEATURE FLAGS

A Mode Profile should expose explicit subsystem activation.

Conceptual:
features:
  ssi: true | false
  trueSelf: true | false
  reincarnation: true | false
  revive: true | false | mode_defined
  authority: full | reduced | disabled
  narrative: enabled | disabled | mode_defined
  historySnapshots: enabled | disabled
  continuousMovement: true | false
  roomSystem: true | false
  localEconomy: true | false
  structures: true | false
  deckDeployment: true | false | mode_defined
Feature flags are not Tags.
deckDeployment indicates whether the Mode exposes Deck → Battlefield deployment as an active subsystem.
Current direction:
TURN_BASED_MAIN: enabled;
Arena participant transfer is not Deck deployment;
other modes remain profile-defined unless explicitly locked.
This feature flag does not imply that every Deck member is currently deployable.
Deck membership, current deployment state and actual deployment eligibility remain separate runtime concerns.

---

# 62. MODE-SPECIFIC CONTRACT REFERENCES

Mode Profile can bind named Contract profiles.

Example concept:

```yaml
TURN_BASED_MAIN:
  schedulingContract: SSI_V1
  lifecycleContract: TRUE_SELF_REINCARNATION_V1
  spatialContract: SLOT_GRID_V1

EXPLORATION_DEFENSE:
  schedulingContract: REALTIME_EXPEDITION_TBD
  lifecycleContract: EXPEDITION_LIFE_TBD
  spatialContract: CONTINUOUS_ROOM_V1
```

---

# 63. CROSS-MODE CHARACTER IDENTITY

Same roster Character remains same `characterId` across modes.

Mode-specific Ability variant does not create a new identity.

Example:

```text
Character X
Turn-based Combat Definition A
Exploration Combat Definition B
```

Identity remains X.

---

# 64. CROSS-MODE COMBAT DEFINITION

Mode can bind a different Combat Definition/profile.

This is conceptually similar to Combat Definition selection, but not necessarily runtime inheritance.

Do not confuse:
- mode profile variant;
with
- Pygmalion inherited Combat Definition.

---

# 65. CROSS-MODE PRESENTATION

Modes may reuse:
- model;
- sprite;
- animation;
- VFX;
but can also use mode-specific presentation.

Presentation variation does not change semantic Character identity.

---

# 66. CROSS-MODE TAGS

A Tag keeps same meaning across modes.

If a mode-specific Ability no longer causes `REINCARNATION`:
> that Ability variant simply lacks the Tag.

Do not define:
- TURN_BASED_TRUE_DAMAGE;
- EXPEDITION_TRUE_DAMAGE.

---

# 67. CROSS-MODE PRIMITIVES

Primitives should remain mode-agnostic where semantic operation is shared.

Examples:
- BUILD_DAMAGE_PACKET;
- RESOLVE_DAMAGE_PACKET;
- RESOLVE_HEAL;
- CREATE_STATE_INSTANCE.

Mode adapter supplies:
- target geometry;
- scheduling;
- movement;
- lifecycle.

---

# 68. MODE-SPECIFIC PRIMITIVE GATEWAYS

A mode can require true system-level operations.

Exploration may later need:
- create structure;
- convert resource;
- claim Room;
- move Base;
- settle stage.

These should become domain/system primitives only after the mode mechanics are sufficiently specified.

Do not invent them prematurely.

---

# 69. MODE TRANSITION

If future game flow moves an entity from one mode to another:

```text
end current Combat/Stage context
→ persist allowed progression state
→ create new Mode Profile context
```

Do not carry transient:
- turn-based Buffs;
- Room-local resources;
- SSI pointer;
unless an explicit cross-mode rule says so.

---

# 70. MODE-LOCAL STATE

State must declare persistence scope.

Possible:

```text
ACTION
COMBAT_INSTANCE
STAGE
MODE_RUN
ACCOUNT
```

Exploration local resources likely use:
`STAGE` or `MODE_RUN`.

Global currency uses:
`ACCOUNT`.

---

# 71. TURN-BASED STATE SCOPE

Ordinary combat Buff/Debuff/Mark:
> Combat Instance or battle scope.

Luân Hồi:
> encounter/world combat lifecycle scope.

Quang Ảnh snapshots:
> battle history scope.

---

# 72. EXPLORATION STATE SCOPE

Potential:
- room cleared;
- structure built;
- local resource stock;
- Base Energy;
- Rune modifiers;
persist across Rooms within stage.

Exact persistence between stages unresolved.

---

# 73. MODE VALIDATION

Normalizer must reject:

### Turn-based-only semantic in disabled mode
Example:
Ability references:
`NATURAL_ACTION_OF_TARGET`
inside a mode with no SSI/Natural Actions.

### Reincarnation in mode with lifecycle disabled
unless Ability explicitly invokes a separate supported system.

### Slot target in continuous spatial mode
unless adapter maps it intentionally.

### continuous movement stat used as SSI speed
without explicit translation.

---

# 74. MODE FALLBACK

Do not automatically translate unsupported turn-based effects into “closest” real-time equivalent.

Example:
> “Stun for 2 Natural Actions”

cannot silently become:
> “Stun 2 seconds”.

Mode-specific Ability variant must define intended behavior.

---

# 75. SIMPLIFIED KIT PRINCIPLE

Simplification is semantic redesign, not automatic conversion.

If turn-based Character has:
- 2 complex passives;
- 2 skills;
- Counter;
- Reincarnation interaction;

Exploration variant can intentionally have:
- Normal Attack;
- one Passive;
- one active Skill;
- Ultimate.

Do not auto-port every trigger.

---

# 76. AI AUTHORING BY MODE

When AI normalizes a Character:

1. read Character core identity;
2. read requested Mode Profile;
3. select correct Ability variant;
4. reject unsupported mode concepts;
5. preserve user-designed differences;
6. do not assume turn-based behavior transfers.

---

# 77. MODE PROFILE IN CAPABILITY INDEX

Capability query should be mode-aware.

Example:

Character X:
- has TRUE_DAMAGE in turn-based Skill;
- does not have TRUE_DAMAGE in Exploration variant.

Query:

```text
HAS_CAPABILITY(X, TRUE_DAMAGE, mode=TURN_BASED_MAIN)
```

can be true.

```text
HAS_CAPABILITY(X, TRUE_DAMAGE, mode=EXPLORATION_DEFENSE)
```

can be false.

---

# 78. NARRATIVE MODE AWARENESS

If Narrative Story searches roster capability:
> query must specify which Combat Definition/Mode Profile counts.

Do not assume turn-based full kit capability if Story exists in another mode.

---

# 79. AUTHORITY MODE AWARENESS

Turn-based currently enables full Authority system.

Exploration Authority behavior is unresolved.

Options later:
- full Authority retained;
- simplified;
- disabled for most effects;
- boss/system-only.

Do not inherit full turn-based adjudication automatically.

---

# 80. DEATH MODE AWARENESS

`DEATH_CONFIRMED` may remain useful in any mode.

But consequences differ:

Turn-based:
- True Self;
- Revive;
- Luân Hồi.

Exploration:
- no Luân Hồi;
- fail/injury/respawn semantics unresolved.

Same death event can feed different lifecycle profiles.

---

# 81. RESOURCE MODE AWARENESS

Resource key alone is insufficient.

Runtime query must know:

```text
resourceKind
poolOwner
modeProfile
```

AE in turn-based:
> team pool.

Turn-based class Action regeneration is also Mode-owned:

actual Natural Action ACTION_COMPLETED
→ lookup Actor Effective Class
→ gain AE from TURN_BASED_MAIN table
Other modes do not inherit this table automatically.
In particular:
EXPLORATION_DEFENSE
still has unresolved AE ownership/action-economy semantics and must not silently reuse the Turn-based Class table.
Other modes do not inherit this table automatically.
In particular:
EXPLORATION_DEFENSE
still has unresolved AE ownership/action-economy semantics and must not silently reuse the Turn-based Class table.

AE in Exploration:
> unresolved.

---

# 82. TARGET MODE AWARENESS

Same TargetSpec concepts can map through mode adapters.

Examples:

```text
ENEMY
ALLY
SELF
RANDOM
NEAREST
LOWEST_HP
```

can be shared.

But Geometry differs:
- slots/rows/columns;
- continuous radius/cone/line.

---

# 83. POSITION MARK MODE AWARENESS

`POSITION_MARK` semantic can exist in both modes, but Position representation differs.

Turn-based:
> Slot.

Exploration:
> coordinate/area marker.

Do not change Tag meaning.

---

# 84. FIELD MODE AWARENESS

`FIELD` can represent:
- slot-based persistent battlefield effect;
- continuous spatial zone.

Field Contract binds spatial adapter.

---

# 85. PERFORMANCE PROFILE

Mode Profile can supply runtime performance hints.

Examples:

Turn-based:
- low entity count;
- deep trigger/Authority complexity.

Exploration:
- higher entity count;
- more frequent movement/projectiles;
- simplified Character kit.

This can influence implementation architecture without changing semantics.

---

# 86. UNITY IMPLEMENTATION IMPLICATION

Turn-based runtime may favor:
- deterministic logical tick/event simulation;
- low-frequency action commits.

Exploration may favor:
- fixed update/tick;
- spatial partitioning;
- pooled entities;
- data-oriented hot loops.

Both can still use same semantic Kernel foundations.

---

# 87. ECS POSSIBILITY

Exploration may benefit more from ECS/data-oriented runtime due:
- many creeps;
- structures;
- movement;
- attack cadence.

Turn-based may not require ECS.

Mode Profile architecture intentionally allows hybrid implementation.

---

# 88. GAMEPLAY KERNEL VS SIMULATION ADAPTER

Recommended split:

```text
Semantic Kernel
  - damage
  - state
  - lifecycle
  - authority
  - capability
  - action/effect resolution

Mode Simulation Adapter
  - SSI scheduling
  OR
  - real-time movement/attack scheduling
```

This is more stable than one engine loop trying to model both modes identically.

---

# 89. EXPLORATION REAL-TIME ACTION MODEL — OPEN

Before coding, must decide at least:

- attacks event/tick;
- animation-cancel policy;
- movement during cast;
- cooldown model;
- targeting updates;
- interruption;
- projectile travel;
- attack-speed scaling;
- skill AI/manual control.

Do not derive these from SSI.

---

# 90. EXPLORATION CONTROL MODEL — OPEN

Still unresolved:
- directly control only Explorer NPC?
- directly control roster Characters too?
- roster Characters use AI?
- player gives squad commands?
- hybrid manual/AI?

Mode Profile must not assume.

---

# 91. EXPLORATION DEATH MODEL — OPEN

Still unresolved:
- recruited Character death temporary?
- injury?
- lost for stage?
- automatic respawn?
- return to Base?
- stage failure on Explorer NPC death?
- Base destruction failure?

No Luân Hồi does not answer these questions.

---

# 92. EXPLORATION BASE FAILURE — OPEN

Need future decision:
- Base has HP?
- Base can be destroyed?
- destruction = immediate failure?
- repair?
- retreat?

Do not implement generic tower-defense fail state yet.

---

# 93. EXPLORATION EXTRACTION

Stage ends when Base reaches discovered extraction under current design.

Need future Contract:
- must all Characters return?
- uncollected local resources lost?
- Structures abandoned?
- enemies stop immediately?
- can player retreat early?

---

# 94. SETTLEMENT TIMING

Current locked conceptual point:

```text
Base reaches valid Extraction
→ stage settlement
→ read BaseStoredEnergy
→ multiply SettlementRatio
→ convert to Global Currency
```

Unconverted local resources do not count.

---

# 95. RUNE SETTLEMENT INTERACTION

Rune profile can modify SettlementRatio.

No-Rune ratio:
`1.0`.

Do not assume:
> easier Rune always lowers reward
until user defines it.

---

# 96. MODE PROFILE VERSIONING

Each Mode Profile should eventually include:

```text
modeProfileId
modeProfileVersion
```

Replay/save should record it.

---

# 97. CONTENT IMPACT QUERY

Tooling should answer:

- Which Characters have Exploration variants?
- Which Abilities are turn-based only?
- Which kits use Reincarnation?
- Which Abilities reference Natural Action clocks?
- Which effects depend on slot geometry?
- Which Characters lack simplified mode profiles?

Useful before bulk migration.

---

# 98. MODE PROFILE ANTI-PATTERNS

Reject:

## A
`if mode == exploration` scattered through every damage function.

Use Mode Profile/adapter.

## B
Copy-paste entire Kernel for each mode.

Shared semantics should remain shared.

## C
Force Exploration into SSI.

Wrong scheduler.

## D
Auto-convert turn durations to seconds.

Semantic invention.

## E
Use same Ability data even when user explicitly wants simplified kit.

Mode variants exist for a reason.

## F
Make Puppet a Summon only in one mode unless semantic rule explicitly changes.

Entity kind should remain coherent.

## G
Make Tag definitions mode-specific.

Tag semantic must stay canonical.

---

# 99. TURN-BASED PROFILE CHECKSUM

A model understands turn-based profile if it preserves:

1. SSI alternation.
2. Natural Action opportunity distinction.
3. Turn Boundary between consecutive Natural Actions.
4. Actor Natural Action windows for personal caps.
5. team AE.
6. actor Rage.
7. True Self/Luân Hồi.
8. Death Cohorts.
9. full Authority.
10. slot geometry.
11. Target Selection ≠ Area Resolution.
12. non-natural child/reaction actions do not advance SSI by default.
13. Deck membership is distinct from current deployment state / deployability.
14. Deck deployment is distinct from Summon creation and Ability Cost.
15. Deployment Cost Bar is distinct from AE and Rage.
16. Successful Deck deployment sets Current Rage = Max Rage but does not auto-cast Ultimate.
17. Side-relative Slot directions resolve from declared Side orientation.
18. Deployment obeys current SSI pointer/pass state and grants no bonus Natural Action.
19. Actual completed Natural Actions grant Side/team AE from the Actor's Effective Class table; CC-lost opportunities and non-Natural Actions grant none.
20. Class AE regeneration occurs only after root-linked blocking settlements and `ACTION_COMPLETED`, before SSI pointer/Turn Boundary continuation.
21. Rage-ready legal Ultimate has default priority at the Actor's actual Natural Action unless an explicit Character/System Action-form restriction overrides that Mode default.
22. Full Rage still does not mean an immediate Ultimate cast at the moment Rage becomes full.

---

# 100. ARENA PROFILE CHECKSUM

A model understands Arena if:

1. Arena is child/isolated Combat Instance.
2. participant transfer is not death.
3. identities persist.
4. Arena can have separate scheduling/positions.
5. global Luân Hồi can still observe true death.
6. Arena-owned objects do not auto-transfer.
7. return/cleanup policy is explicit.

---

# 101. EXPLORATION PROFILE CHECKSUM

A model understands Exploration/Defense if:

1. no SSI.
2. no Luân Hồi.
3. direct Explorer NPC control is core current direction.
4. roster Characters are recruited during run from owned roster.
5. Rooms are large spatial regions, not slots.
6. movement speed/attack speed/weight matter.
7. simplified Character kit is intentional.
8. Rage remains.
9. AE gain exists but ownership unresolved.
10. ≥15 local resource types planned.
11. ≥10 structure/tower types planned.
12. Base converts local resources ↔ Energy with reverse loss.
13. settlement reads only Base Energy.
14. no-Rune SettlementRatio=1.
15. Runes can modify reward ratio.
16. Base must reach extraction to settle stage.
17. exact Base transport/death/control models remain unresolved.
18. local resources ≠ Energy ≠ Global Currency.

---

# 102. MODE PROFILE ACCEPTANCE TEST

This file passes Chặng H if:

- [x] mode differences are explicit profiles, not hidden `if` logic.
- [x] Character identity remains shared.
- [x] Ability variants can differ per mode.
- [x] turn-based keeps SSI/Luân Hồi.
- [x] Exploration explicitly disables SSI/Luân Hồi.
- [x] Arena is modeled as Combat Instance profile.
- [x] shared Tags/Primitives keep same meaning.
- [x] continuous and slot spatial models use adapters.
- [x] resource ownership can differ.
- [x] unsupported turn semantics are not auto-converted to real-time semantics.
- [x] unresolved Exploration mechanics remain visible.
- [x] old deleted mode content can migrate without preserving old runtime architecture.

---

# 103. WHAT SHOULD NOT BE FROZEN YET

Before implementing Exploration/Defense, still discuss:

1. exact simplified Ability slot model;
2. who is manually controlled;
3. roster Character AI;
4. real-time scheduler;
5. cooldown;
6. attack speed formula;
7. AE ownership;
8. death/failure;
9. Base HP/failure;
10. Base movement;
11. Room spawn timer;
12. Room ownership/control;
13. local resource list;
14. structure list;
15. conversion rates;
16. Rune catalog;
17. settlement conversion;
18. persistence between stages.

These gaps do not block turn-based Kernel stress testing.

---

# 104. RECOMMENDED NEXT STAGE

After Chặng H:

> **Chặng I — `08_STRESS_TESTS.md`**

This should be the last major architecture-validation stage before bulk-normalizing the roster.

`08_STRESS_TESTS.md` should not just list mechanics.

It should define scenario fixtures, initial state, actions, expected trace/state, and invariant assertions for:

- simple damage;
- mixed/true damage;
- pooled Shield;
- HP Cost/HP Loss;
- simultaneous AoE;
- sequential multihit;
- Target Exclusion;
- displacement;
- Follow-up/Counter/Forced Action;
- same-tier Authority;
- Death Cohorts;
- Revive;
- Reincarnation;
- Pygmalion;
- Arena;
- Quang Ảnh;
- Narrative;
- mode isolation.

Only after these pass should the project migrate 200+ kits at scale.

---

# 105. FINAL MODE ARCHITECTURE

Canonical direction:

```text
                    Character Identity
                           │
                           ▼
                  Mode-specific Combat Definition
                           │
                           ▼
               Authoring Ability Schema / Normalized IR
                           │
                           ▼
                   Shared Semantic Kernel
                   /                   \
                  /                     \
       Turn-Based Adapter          Exploration Adapter
      SSI / Slots / Luân Hồi     Real-time / Rooms / Economy
                 \
                  \
               Arena Child Combat Instance
```

The point is not to force every mode into one runtime shape.

The point is:

> **share what is semantically the same, isolate what genuinely differs.**
