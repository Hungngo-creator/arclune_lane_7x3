# Kernel Phase C2 migration

C1 supplied identities, packet allocation, batch resolution, HP gateways, and lifecycle helpers, but production still contained detached-action fallback and the basic-follow-up parent was read after its context closed. C2 removes that fallback and keeps follow-ups in linked actions sharing the root chain ledger.

C2 adds action transactions, persistent life/death/revive ledgers, deterministic registered prevention, hardened canonical revive lookup, delayed revive clocks, battle-end evaluation, and explicit non-death removal. Action resolution now accepts non-damage actions. Immediate revive preserves shared AE and purge retains unpurgeable statuses.

Remaining before C3: adapt every legacy passive into prevention/reaction registrations and connect every older status/environment damage path to action resolution. Reincarnation, concrete Axiom effects, and Quang Anh Chi Ha are explicitly out of scope.

