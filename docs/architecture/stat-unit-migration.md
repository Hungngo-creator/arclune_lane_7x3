# ARM/RES stat-unit migration report

Canonical ARM and RES use **defense rating** units. No data is multiplied by 100
merely because it is small.

| Source | Existing meaning | Phase A handling |
|---|---|---|
| Unit/catalog base stats and growth/stat resolver | Rating; consumed by `100/(100+d)` | Kept unchanged. |
| `dealAbilityDamage` | Rating, formerly non-negative-clamped before formula | B1 batch packets; negative ratings remain meaningful and percent penetration is clamped to `0..1`. |
| Passive flat/percent status aggregation (`passives.ts`) | Flat adds a rating; percent scales a rating | Removed erroneous final `clamp01`; retains two decimal rating precision. |
| PvE summon/creep inheritance (`session-runtime-impl.ts`) | Ratio of master's current rating | Removed erroneous inherited ARM `0..1` clamp; RES already retained rating. |
| Status DoT and legacy reflect (`statuses.ts`) | Rating, with local non-negative clamp and mixed weighted defense | Compatibility bypass retained; TODO Phase B packet migration and negative-defense support. |
| Reflect mini-pipeline (`combat.ts`) | Rating with local non-negative clamp | Compatibility bypass retained; TODO Phase B reflected packet migration. |
| Chap Minh runtime | Rating-derived kit conversion | Retained; kit semantics deliberately cap at its own conversion boundary. |
| Ly Thanh Thu runtime buffs | Adds/removes rating | Retained; zero floor is restoration safety, not percentage conversion. |
| Vĩnh Dạ simulation | Rating in preview formula | Retained outside the PvE kernel. |
| Chess strategy RPG mode | Flat subtraction in separate ruleset | Out of kernel scope; retained. |

Small catalog values remain ratings until provenance proves otherwise. **TODO:**
inventory individual data records in Phase B before introducing any explicit
legacy-percentage adapter. This avoids silently multiplying ambiguous values by
100.

## Numerical migration note

The canonical resolver floors once per component packet. The old standard path
floored raw, counter, defense, and incoming-reduction stages separately. Mixed
damage formerly used one weighted-average defense multiplier; it now becomes two
packets and each component floors once. Golden packet fixtures are the portability
authority for the Unity/C# implementation.

## Phase C1 integration

Phase C1 adds the action-wide resolution coordinator and canonical life/death contracts described in `action-resolution-contract.md` and `life-death-lifecycle.md`. HP mutation commits are typed non-damage writes; immediate revive is policy-explicit. Remaining compatibility paths and the exact C2 boundary are recorded in `kernel-phase-c1-migration.md`.