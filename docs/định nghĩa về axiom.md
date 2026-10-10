# Axiom foundation — Thiên Điều và Axiomatic Trait

Axiom Identity, Authority Tier, Functional Tag và Capability là bốn namespace khác nhau. `AXIOM` là tier cao nhất hiện hành; một Axiom identity không tự nâng Authority của Character Ability. Rank cũng không cấp access, dependency hoặc Thần Tính. Clause thực sự xung đột dùng AUT hiện hành, không invent tier cao hơn AXIOM.

## Hai ownership family

**WORLD_AXIOM / Thiên Điều** thuộc Combat/System layer, không có Character owner và không gắn lên Character như Trait. Character có thể chịu tác động, query, khai explicit normalized dependency/access hoặc author mechanic tương tác với World Axiom. Access không suy từ UR/Prime.

World Axiom phải khai residency; không có luật “mọi World Axiom tự động tồn tại trong mọi trận”:

| Axiom Identity | Residency trong real Combat Instance |
| --- | --- |
| `WORLD_AXIOM_REINCARNATION` | `ALWAYS_RESIDENT` |
| `HEAVENLY_THUNDER_IMPARTIALITY` | `ALWAYS_RESIDENT` |
| `RIVER_OF_LIGHT_AND_SHADOW` | `CONDITIONAL_IMPORT` |

Future World Axiom phải khai rõ `ALWAYS_RESIDENT` hoặc `CONDITIONAL_IMPORT`. Mode adapter không được tắt một luật ALWAYS_RESIDENT; thiếu cadence phải ghi `REQUIRED_EXPLICIT`, không giả vờ subsystem vắng mặt.

**AXIOMATIC_TRAIT** là metadata/property gắn với Character/Identity/Life theo scope đã author, không phải World subsystem. Current traits `DIVINE_NATURE` và `UNIQUENESS` có clauses Authority AXIOM; không cấp AXIOM cho toàn bộ kit, không đăng ký World system và không tạo Functional Tag mới.

## Thiên Lôi Vô Tư

**Identity:** `HEAVENLY_THUNDER_IMPARTIALITY`; **residency:** `ALWAYS_RESIDENT`; World-owned, không phe, caster, Character owner hoặc Leader exemption.

Eligible domain là Field-Present entity có authoritative CurrentHP/CurrentMaxHP và Damage/lifecycle-valid unit profile: Character, Leader, Summon, Puppet và HP-bearing gameplay unit khác đủ điều kiện. Numeric `hp` trên scenery không tự cấp eligibility. Prime/Thần Tính không miễn Thiên Lôi. Shared-body parts phải project về authoritative lifecycle/stat/HP owner, không nhân số subject bằng số part.

### Subject và immutable Heavenly baseline

Bound Chân Ngã: subject key = `trueSelfId × CombatInstance`. Không bound Chân Ngã: `actor/life identity × CombatInstance`.

Tại first eligible materialization, capture immutable `HEAVENLY_STAT_BASELINE` sau static initialization/Rank/Star/static progression, trước transient combat Buff/Debuff/temporary modifiers. Theo dõi chỉ Stat có authoritative metadata `Rank-Multiplier-scaled`; không hardcode tên stat theo Character. Active Stat Definition/profile phải bind đúng stat provider (HP capacity đọc CurrentMaxHP, không CurrentHP). Profile xác định HP/ATK/WIL/ARM/RES scaled và SPD không scaled thì dùng đúng metadata đó; không promote legacy executable stat tables thành authority. Invalid/non-positive denominator phải reject hoặc có explicit supported profile, không tự xử lý chia zero.

Buff/Debuff/temporary State, stat mutation, transformation, Revive, Return-to-Deck và redeploy không thay baseline. True Self đời/body mới vẫn dùng baseline đầu tiên của chính trueSelfId trong instance. Body ban đầu không Chân Ngã rồi nhận một Chân Ngã chuyển sang record baseline/counter của True Self tại successful binding checkpoint; không merge/reset bằng body-only record. Nếu True Self chưa có record, tạo first static basis của subject theo cùng initialization profile, không lấy transient effective stats làm baseline.

### Violation và checkpoints

Subject vi phạm nếu **ít nhất một** tracked Effective Stat `>= 3.5 × baseline` (+250%, equality qualifies), hoặc Actor **thực sự có Rage resource** với `CurrentMaxRage <= 50`. Không có Rage resource không phải MaxRage0. Nhiều cause cùng checkpoint tạo **one strike** với typed cause set.

Evaluate ở finite authoritative checkpoints: eligible materialization/reentry; committed mutation thay tracked Effective Stat, baseline/True-Self binding hoặc CurrentMaxRage; beginning mỗi owner Natural Action opportunity trong TURN_BASED_MAIN, đọc trước State expiry/start settlements theo chốt designer mới; mutation sau đó vẫn có World checkpoint riêng. Evaluate sau toàn bộ atomic mutation ở stable committed view; không polling/frame hoặc xen vào transaction.

Non-violating → violating khi Field Present: strike ngay. Materialize/reenter đang vi phạm: strike ngay. Main persistent violation: one strike tại **mỗi Natural opportunity start**, rồi mandatory HP_ZERO/lifecycle; chỉ còn legal/alive mới tiếp tục opportunity/Action. CC-lost opportunity vẫn bị đánh; non-Natural Action không tạo periodic strike. Leave Field dừng periodic work, không reset baseline/count; trở lại legal dừng periodic strike.

`heavenlyStrikeCount` cùng subject key tăng một lần mỗi committed strike, kể cả Shield absorb100%. Count theo True Self xuyên death/waiting/Revive/Deck/redeploy/Reincarnation/new body trong cùng instance; body-only count theo actor/life. Violation tạm hết không reset. Record terminal có thể giữ cho replay, không strike khi không có active subject. Replay/dedup không tạo strike thứ hai cho cùng subject/checkpoint.

### Heavenly Damage

Mọi strike request **TRUE Damage =20% × target CurrentMaxHP**, snapshot tại strike checkpoint; không scale theo strike count. Damage profile và world clause mang Authority AXIOM; không cần Functional Tag `AXIOM_TRUE_DAMAGE`.

Không ARM/RES/penetration math, ordinary FDR/scoped reduction/Damage cap/take-less, Evasion/Miss/Taunt/target-redirection/Damage-redirection hoặc lower-tier immunity/denial được giảm/chuyển cú đánh. Future explicit AXIOM conflict dùng AUT; không coi World identity là tier cao hơn AXIOM. System-vs-AXIOM cần supported adjudication profile của actual System clause, không tạo Character owner/Prime Rank giả.

**Shield exception:** strike1–3 dùng ordinary Shield contribution ledger. Shield absorption khác Damage Reduction; count vẫn tăng khi absorb all. Strike4+ bypass Shield hoàn toàn: không consume, deplete hoặc split vào Shield; Shield giữ nguyên.

Sau Damage commit vẫn chạy mandatory HP_ZERO/lifecycle. Death Prevention có thể xử lý theo Contract của nó, vì không phải Damage Reduction; Thiên Lôi không tự là ERASE hoặc “cannot be saved”.

## Luân Hồi

**Identity:** `WORLD_AXIOM_REINCARNATION`; **residency:** `ALWAYS_RESIDENT` trong mọi real Combat Instance, gồm Arena/Exploration. World ledger/lifecycle owner; các kit là consumer/router.

**Iron law:** `NO BOUND TRUE SELF → NEVER ENTER REINCARNATION_WAITING`. DEATH_CONFIRMED đọc valid authoritative binding tại death checkpoint. Body sinh ra empty nhưng đang giữ Chân Ngã thì route đúng Chân Ngã đó vào waiting; Chân Ngã đã lấy khỏi body trước death thì không waiting, không fake soul. No-True-Self body terminally exits nếu không có explicit Death Prevention/own Revive/Return/replacement/Arena transition/lifecycle entitlement khác.

Reuse Death Cohort, waiting ledger, current battle-base threshold/contributions, route contention và Revive-vs-Reincarnation ordering. World bookkeeping trước ordinary queued reactions. Ordinary Revive trước ENTERED_REINCARNATION đóng waiting record; đã ENTERED thì old life không ordinary Revive-eligible.

Không có eligible in-combat host/rebirth/capture/route: True Self **rời Combat Instance** (lore đầu thai nơi khác), không auto materialize hoặc random Character mới. Pygmalion/Luân Hồi Chi Chủ/Kenoma không sở hữu World Axiom.

### Previous-life inheritance không phụ thuộc River

Qualifying bound-True-Self DEATH_CONFIRMED capture one immutable candidate `PREVIOUS_LIFE_INHERITANCE_BASIS`, key `trueSelfId × lifeSerial × deathRecord`. Ordinary Revive trước ENTERED retire candidate cùng waiting record. ENTERED seal/promote basis cho eligible route; một archived/inactive death record không tự thành basis của transition khác.

Basis thuộc lineage của Luân Hồi, không phải full History snapshot. Default “N% stat đời trước” dùng typed inheritance profile: intrinsic/static/Rank-Multiplied stat basis và battle-persistent growth/contribution được profile đánh dấu inheritable; loại transient Buff/Debuff/temporary State/temporary Field contribution. Không copy CurrentHP, AE/Rage, Shield, State objects, cooldown, durations hoặc temporary transformation. Muốn kế thừa transient contribution phải author exception riêng; không bake temporary+100% Buff thành permanent base mặc định.

Luân Hồi Chi Chủ có stat-fraction profile dùng basis này; exact finite stat fields vẫn phải resolve. Pygmalion giữ own host/creator stat basis; Kenoma chỉ host-bind giữ current body/stats. Không silently thay hai profile đó bằng previous-life stat inheritance. Special Ký Ức ordinary Revive snapshot cũng giữ explicit riêng, không bị đổi thành default Reincarnation basis.

Thiên Lôi theo True Self xuyên đời: baseline đời1 B giữ ở đời2; stat đời2>=3.5B vi phạm tại materialization. Đã chịu3 strikes thì cú tiếp theo #4 xuyên Shield ngay.

## Duy Nhất

**Identity:** `UNIQUENESS`; **classification:** `AXIOMATIC_TRAIT`; clause Authority AXIOM. Scope/key từ canonical Character/Identity ownership; `uniquenessIdentity` biểu diễn typed key nếu cần. FORM cùng Character không tự tạo key mới.

Deck không claim. Acquire tại successful materialization/deployment commit. Winner theo authoritative gameplay request/transaction ordering, không Entity/Slot/list/iteration/Event-publication order. Materialization/claim/payment cùng protected commit; duplicate illegal không được xuất hiện trước rồi rollback.

Claim giữ qua actual leave, Return-to-Deck, Temporary Absence, HP_ZERO, DEATH_CONFIRMED, Waiting và ordinary Revive. True-Self old-life claim release tại actual ENTERED_REINCARNATION nếu không có atomic same-key continuation; atomic new-life same-key continuation giữ/transfer claim không mở race window. Default True Self rời instance sau entry thì release, không đợi một death/leave trước entry. No-True-Self unique entity chỉ release tại terminal exit khỏi instance theo lifecycle Contract, không chỉ vì rời Field.

A deploy Lậu Khắc trước: B's Lậu Khắc vẫn trong một of four Deck slots, chiếm slot, deploy illegal khi A claim còn active; không reroll/replace/đổi Character. Release claim mới cho B thử deploy theo ordinary conditions. Random materializers giữ candidate-filter/failure policy riêng; no-reroll Deck không trở thành luật của mọi random generator. Chỉ invariant “illegal duplicate cannot commit” là chung.

## Thần Tính

**Identity:** `DIVINE_NATURE`; **classification:** `AXIOMATIC_TRAIT`; admission clause Authority AXIOM. Definition phải author trait rõ; Prime không mặc định có trait.

External = **semantic Effect/State owner != recipient self**, không phân ally/enemy, không dùng Damage Attribution/visual caster thay owner. Reject external BUFF/DEBUFF/MARK có incoming clause Authority NORMAL/PHAP_TAC/QUY_TAC, kể cả có lợi/hại/trung tính và ally Buff. Self-owned low-tier Buff/Debuff/Mark không bị trait này block; ordinary legality vẫn áp dụng. External AXIOM State là real AXIOM-vs-AXIOM conflict dùng AUT, không auto thắng cho Thần Tính.

Trait không mặc định block Damage, Heal, Shield, Resource/MaxHP mutation, Cost, Position Mutation, History observation, Reincarnation bookkeeping hoặc Uniqueness validation. Muốn block phải có explicit clause riêng; Thiên Lôi vẫn đánh bearer. Trait clause AXIOM không nâng mọi Ability hoặc consumer route thành AXIOM.

## Mode adapter và River audit

TURN_BASED_MAIN bind Luân Hồi/Thiên Lôi ALWAYS_RESIDENT; Thiên Lôi periodic ở owner Natural opportunity start. Exploration/real-time real Combat Instances giữ residency và shared materialization/mutation checks, nhưng không tự map periodic Natural cadence sang seconds/attack cycles. Cadence ngoài Natural model = `REQUIRED_EXPLICIT MODE ADAPTER`; missing scheduling khác của Luân Hồi cũng giữ explicit, không invent waiting wall-clock. Các adapter này không chặn Main foundation.

Quang Ảnh section bên dưới giữ semantics PR #48: conditional import; generic History provider; baseline/profile-driven actually performed Natural capture; record≠restore; AE/Rage/RNG/Reincarnation/direct Deployment Cost Bar non-restorable; receipt-backed50% Lậu Khắc deployment refund riêng. Không Character-specific History service. World baseline/strike counters, lineage và Unique claim là system/identity-owned records, không phải restorable Character counter chỉ vì snapshot có quan sát chúng. Historical presence vẫn validate current Unique claim; Return về Deck không release, còn actual no-True-Self terminal exit vẫn dùng ENT-021 lifetime, không copy claim từ snapshot.

Normative bindings: 01§§14–15; 04§§3.6/32.4–32.5/31.2/79–80; 05 INS-003/STA-011/REC/ENT-021–022/AUT/HIS; 06 existing Combat Instance/Stat/Resource/Lifecycle/Reincarnation/Admission/Materialization/Transaction owners; 07 Mode profiles; 08 foundation stress obligations. Không thêm Functional Tag, Primitive, Character manager, callback bus hoặc rollback VM.

## Quang Ảnh Chi Hà

**Axiom Identity:** `RIVER_OF_LIGHT_AND_SHADOW`.
Tên gọi thông thường: **Thời Gian Trường Hà**. Đơn vị dữ liệu: **Quang Ảnh**. Điểm lưu lịch sử: **Mốc Quang Ảnh**.

Quang Ảnh Chi Hà là **World-Axiom History provider**, dùng chung cho các kit thời gian. Phạm vi World-Axiom không đồng nghĩa mặc định resident trong mọi Combat Instance. Provider áp dụng **CONDITIONAL_IMPORT**:

- Combat Instance không chứa nội dung có normalized dependency vào River: không import.
- Participant, Deck hoặc definition có dependency: import lúc Combat Instance initialize, trước gameplay, kể cả Character thời gian đang trong Deck.
- Capability xuất hiện động giữa trận: import tại checkpoint đó và tạo baseline tại thời điểm import; không giả tạo lịch sử trước đó.
- Một khi import, giữ provider tới hết Combat Instance dù Character truy cập nó chết/rời sân. Import có thể có Presentation event/VFX; Presentation không quyết định Kernel timing.

Lậu Khắc chỉ là một Character có quyền truy cập; River không thuộc riêng Character và không ban AXIOM Authority cho mọi Skill của họ. Reuse Snapshot Primitive, HIS Contracts và generic History Runtime hiện hành; không tạo History subsystem khác.

### Baseline và capture profile

At import tạo immutable **BASELINE**. Sau đó capture checkpoint theo profile, không theo luật global “snapshot sau mọi complete Action”. Current Lậu Khắc Side-access profile:

```text
actually performed allied Natural root
→ blocking child/outcome/settlement hoàn tất
→ ACTION_COMPLETED
→ capture committed Side Mốc Quang Ảnh
→ SSI tiếp tục
```

CC-lost Natural opportunity không thực hiện Action, Forced/Follow-up/Counter/Reaction, child riêng, mỗi hit và State tick không tạo checkpoint riêng. Blocking work đã nằm trong resulting state của root.

Mốc cần thiết cho selection phải được giữ immutable/available, gồm baseline. Cách lưu snapshot/delta là implementation detail; không được dùng inverse delta để vượt restore whitelist hoặc tùy tiện bỏ mốc còn được gameplay truy cập.

### Ghi nhận khác quyền hồi quy

**HISTORY_RECORD_SCOPE ≠ HISTORY_RESTORE_SCOPE.** Profile có thể ghi battlefield/Deck/waiting membership, Position, CurrentHP/CurrentMaxHP, effective stats/stat contributions, Shield/contribution ledger, Buff/Debuff/Mark, counter/stack/duration, cooldown/form/Character battle state, Side AE, actor Rage và other resources cùng source/provenance. Historical observation không cấp quyền mutation.

Đối với Nghịch Lưu / **SIDE_BATTLE_STATE_NON_RESOURCE**:

- Eligible allied HP/MaxHP/State/Position/membership và battle fields đã khai báo có thể restore.
- Side AE và mọi actor Rage: **OBSERVABLE_ONLY / NON_RESTORABLE**, kể cả caster. Current values tại restore barrier giữ nguyên chính xác; không SET snapshot, tạo delta, refund Cost, undo gain hoặc reset/clamp qua Field-entry/derived resource logic.
- RNG stream/cursor: **NON_RESTORABLE**; dòng sông lưu state history, không rewind future destiny.
- Reincarnation ledger/progress/death order và True-Self/new-life identity: **NON_RESTORABLE**.
- Side Deployment Cost Bar: **NON_RESTORABLE** từ snapshot.

```text
AE_before_restore == AE_after_restore
Rage_before_restore(actor) == Rage_after_restore(actor)
```

AE/Rage có mặt trong Quang Ảnh vẫn chỉ là dữ liệu quan sát. Không có exception cho Ultimate caster; Rage đã tiêu không được hoàn.

### Bounded History Restore

Nghịch Lưu chọn latest committed allied Side Mốc **strictly before current Ultimate Natural Action**, fallback BASELINE nếu chưa có previous Natural snapshot. Current Ultimate chỉ có thể capture resulting state sau completion, không ghi đè input nó đang đọc.

Restore phe đồng minh bằng **SIDE_SCOPED_HISTORY_RESTORE** typed transaction. Enemy HP/State/Sa/Position/resources giữ nguyên. Historical state changes không là ordinary Damage/Heal/Overheal/HP Loss/Cleanse/Buff apply/Debuff apply/Revive/Return-to-Deck/deploy và không kích hoạt các trigger đó; explicit HISTORY_RESTORE observation có thể đọc cause riêng. Không xóa trace hay un-emit Event cũ.

Allied same life DEATH_CONFIRMED còn Waiting, chưa ENTERED_REINCARNATION, có thể về snapshot alive/on Field bằng HISTORY_RESTORE, không ON_REVIVE. Reconcile active battle/waiting eligibility nhưng không rewind ledger/progress. Old life đã ENTERED_REINCARNATION local fail; giữ Chân Ngã/new life/progress hiện tại và tiếp tục other eligible branches. Không thiết kế lại Luân Hồi foundation.

Derive desired allied snapshot layout trước, stage out rewindable post-snapshot occupants, commit occupancy atomically. Protected Reincarnation result chiếm old-life Slot làm old-life branch fail; không displace new life hoặc chọn owner theo iteration. Eligible allied entity created after snapshot và absent trong snapshot bị remove bằng HISTORY_RESTORE reconciliation, không DEATH_CONFIRMED/summon-death. Protected non-rewindable Reincarnation results không thuộc removal branch này.

### Character-authored deployment refund riêng

Nếu roster Character ở Deck tại snapshot, nay Field qua paid DEPLOY_FROM_DECK sau snapshot và Presence đó bị undo, restore về Deck. Kit có thể author partial refund riêng từ **actual committed deployment payment receipt**. Current Lậu Khắc lock:

```text
floor(actualCommittedDeploymentCost ×0.50)
15→7; 14→7; 9→4; 7→3; 1→0
```

Cộng vào current Side Deployment Cost Bar theo active cap; overflow mất. Không dùng Base/Current/nominal cost, không copy snapshot Bar, không double refund. Return/refund/undone receipt commit cùng transaction; replay không trả lại lần hai. Unpaid creations không nhận refund. History return không phải ordinary RETURN_TO_DECK cause.

Phần này thay thế mọi proposal cũ về rewind AE/Rage/Cost, ACTION_COMMIT sau mọi Action, full-field rollback mặc định hoặc Thần Tính exemption suy từ ví dụ. Nó không bổ sung thiết kế Thiên Lôi, Thần Tính, Duy Nhất hay cơ chế Luân Hồi ngoài interaction đã khóa. Exact eligibility/conflicts còn lại dùng Contract hiện hành, không suy Authority từ tên Axiom.
