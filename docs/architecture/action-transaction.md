# Action transaction

C2 defines one ordered transaction: declaration, actor/target/cost validation, reservation, action start, one cost commit, payload resolution, action commit, and action end. Validation failures occur before mutation. Free linked actions use an empty reservation list. Shared AE remains side-owned and is never reset through a revived unit.

