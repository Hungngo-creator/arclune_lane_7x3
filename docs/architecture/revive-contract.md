# Revive contract

C1 supports immediate revive only. `ReviveRequest` explicitly states flat/ratio HP, Rage, AE, status, position, attribution, authority, and summon permission policies. A successful commit requires the exact confirmed `iid + lifeSerial`, preserves iid/true-self, calls `beginRevivedLife` once, restores at least one HP, and emits `REVIVE_COMMITTED`. Duplicate, stale, living-target, and implicit summon revives are rejected. Delayed scheduling belongs to C2.

