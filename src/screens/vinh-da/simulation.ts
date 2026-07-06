import {
  CASTLE_OUTER_LEFT,
  CASTLE_OUTER_RIGHT,
  CRYSTAL_X,
  DEFAULT_STRUCTURE_COOLDOWN,
  ENEMY_ATTACK_RANGE,
  ENEMY_LIMIT,
  ENEMY_SPAWN_INTERVAL,
  ENEMY_START_PADDING,
  LANDMINE_BLAST_RADIUS,
  LANDMINE_FUSE_SECONDS,
  LANDMINE_TRIGGER_RADIUS,
  LANDMINE_TRUE_DAMAGE,
  SPIKE_TRAP_BLEED_MAX_HP_PER_SECOND,
  SPIKE_TRAP_BLEED_SECONDS,
  SPIKE_TRAP_MAX_WEIGHT_EXCLUSIVE,
  SPIKE_TRAP_MIN_WEIGHT,
  SPIKE_TRAP_RADIUS,
  SPIKE_TRAP_SLOW_MULTIPLIER,
  SPIKE_TRAP_SLOW_SECONDS,
  LEADER_ATTACK_RANGE,
  LEADER_BASIC_ATTACK_COOLDOWN_SECONDS,
  LEADER_BASIC_ATTACK_DAMAGE,
  SWAMP_RADIUS,
  WORLD_WIDTH
} from './constants.ts';
import { DEFAULT_ENEMY_TEMPLATE, ENEMY_TEMPLATES } from './enemies.ts';
import type { EnemyKind, EnemyTemplate } from './enemies.ts';
import { BASE_STRUCTURE_STATS, getStructureLevelStat } from './structures.ts';
import type { ElementalTowerElement, StructureType } from './structures.ts';
import type { BuildSite, Enemy, PlacedStructure, Side, StructureRuntime } from './types.ts';

export const DAY_DURATION_SECONDS = 300;
export type DayNightPhase = 'day' | 'night';

export interface VinhDaSimulationState {
  bloodSealStone: number;
  baseHp: number;
  baseLevel?: number;
  contamination?: number;
  leaderX: number;
  enemies: Enemy[];
  nextEnemyId: number;
  enemySpawnTimer: number;
  dayNightPhase: DayNightPhase;
  phaseRemainingSeconds: number;
  leaderAttackCooldown: number;
  structures: Map<string, PlacedStructure>;
}

export interface VinhDaSimulationContext {
  state: VinhDaSimulationState;
  structureSitesByType: Map<StructureType, Set<string>>;
  getBuildSite(siteId: string | null | undefined): BuildSite | null;
  ensureStructureRuntime(structure: PlacedStructure): StructureRuntime;
  getStructureMaxHp(structure: PlacedStructure): number;
  deleteStructure(siteId: string): boolean;
  structureSiteIdsOfType(type: StructureType): Iterable<string>;
  renderEconomy(): void;
  renderBuildSite(siteId: string): void;
  renderDayNightTimer(): void;
  removeEnemyElement(enemyId: number): void;
}

export const spawnEnemy = (ctx: VinhDaSimulationContext, side: Side, kind: EnemyKind = 'twisted'): void => {
    if (ctx.state.dayNightPhase !== 'night' || ctx.state.enemies.length >= ENEMY_LIMIT) return;
    const template = ENEMY_TEMPLATES[kind] ?? DEFAULT_ENEMY_TEMPLATE;
    ctx.state.enemies.push({
      id: ctx.state.nextEnemyId,
      x: side === 'left' ? ENEMY_START_PADDING : WORLD_WIDTH - ENEMY_START_PADDING,
      kind: template.kind,
      hp: template.hp,
      maxHp: template.hp,
      speed: template.speed,
      baseSpeed: template.speed,
      groundSpeed: template.groundSpeed,
      flySpeed: template.flySpeed,
      weight: template.weight,
      attackCooldown: template.attackCooldown,
      atk: template.atk,
      wil: template.wil,
      arm: template.arm,
      res: template.res,
      tier: template.tier,
      rank: template.rank,
      projectileSpeed: template.projectileSpeed,
      attackShape: template.attackShape,
      aoeRadius: template.aoeRadius,
      statusOnHit: template.statusOnHit,
      canFly: template.canFly,
      hasCommanderAura: template.hasCommanderAura,
      contaminationOnHit: template.contaminationOnHit,
      bleedOnHit: template.bleedOnHit,
      deathExplosion: template.deathExplosion,
      regen: template.regen,
      dragonDestroyStructure: template.dragonDestroyStructure,
      ultimate: template.ultimate,
      side
    });
    ctx.state.nextEnemyId += 1;
  };
const applyContaminationHit = (ctx: VinhDaSimulationContext, enemy: Enemy): void => {
    if (!enemy.contaminationOnHit) return;
    ctx.state.contamination = (ctx.state.contamination ?? 0) + 1;
  };
const triggerDeathExplosion = (ctx: VinhDaSimulationContext, enemy: Enemy): void => {
    if (!enemy.deathExplosion) return;
    const radius = enemy.aoeRadius || getEnemyTemplate(enemy).aoeRadius;
    const damage = Math.max(enemy.atk, enemy.wil) * 2;
    if (Math.abs(enemy.x - CRYSTAL_X) <= radius) damageBase(ctx, damage);
    for (let i = ctx.state.enemies.length - 1; i >= 0; i -= 1){
      const target = ctx.state.enemies[i];
      if (!target || target.id === enemy.id || Math.abs(target.x - enemy.x) > radius) continue;
      if (damageEnemy(ctx, target, damage)) removeEnemyAt(ctx, i, true);
    }
  };
export const removeEnemyAt = (ctx: VinhDaSimulationContext, index: number, reward: boolean): void => {
    const [enemy] = ctx.state.enemies.splice(index, 1);
    if (!enemy) return;
    ctx.removeEnemyElement(enemy.id);
  triggerDeathExplosion(ctx, enemy);
    if (reward){
      ctx.state.bloodSealStone += ENEMY_TEMPLATES[enemy.kind].reward;
      ctx.renderEconomy();
    }
  };
export const clearEnemiesWithoutReward = (ctx: VinhDaSimulationContext): void => {
    while (ctx.state.enemies.length > 0) removeEnemyAt(ctx, ctx.state.enemies.length - 1, false);
    ctx.state.enemySpawnTimer = 0;
  };
export const getBlockingWall = (ctx: VinhDaSimulationContext, enemy: Enemy): { site: BuildSite; runtime: StructureRuntime } | null => {
    for (const siteId of ctx.structureSiteIdsOfType('wall')){
      const structure = ctx.state.structures.get(siteId);
      if (!structure) continue;
      const site = ctx.getBuildSite(siteId);
      if (!site || (enemy.side === 'left' ? site.x >= CRYSTAL_X : site.x <= CRYSTAL_X)) continue;
      const runtime = ctx.ensureStructureRuntime(structure);
      if (runtime.hp > 0 && Math.abs(enemy.x - site.x) <= ENEMY_ATTACK_RANGE) return { site, runtime };
    }
    return null;
  };
export const damageEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, amount: number): boolean => {
    enemy.hp -= amount;
    return enemy.hp <= 0;
  };

const ELEMENTAL_EFFECT_COOLDOWN_SECONDS = 4;
const BLOOD_MAX_HP_STACK_CAP = 5;
const getBaseStat = (ctx: VinhDaSimulationContext) => BASE_STRUCTURE_STATS[ctx.state.baseLevel ?? 0] ?? BASE_STRUCTURE_STATS[0]!;
const getChurchHealingBonus = (ctx: VinhDaSimulationContext): number => {
  let bonus = getBaseStat(ctx).healingBonusPercent ?? 0;
  for (const siteId of ctx.structureSiteIdsOfType('church')){
    const structure = ctx.state.structures.get(siteId);
    if (!structure) continue;
    bonus += getStructureLevelStat('church', structure.level).healingBonusPercent ?? 0;
  }
  return bonus;
};
const healBase = (ctx: VinhDaSimulationContext, amount: number): void => {
  const stat = getBaseStat(ctx);
  ctx.state.baseHp = Math.min(stat.hp + (stat.shield ?? 0), ctx.state.baseHp + amount * (1 + getChurchHealingBonus(ctx)));
};
const applyElementEffect = (ctx: VinhDaSimulationContext, enemy: Enemy, element: ElementalTowerElement, damage: number, sourceX: number): void => {
  switch (element){
    case 'Hỏa':
      enemy.burnSeconds = Math.max(enemy.burnSeconds ?? 0, 3);
      enemy.burnDps = Math.max(enemy.burnDps ?? 0, damage * 0.35);
      break;
    case 'Mộc':
      healBase(ctx, Math.max(1, damage * 0.6));
      break;
    case 'Thủy':
      enemy.slowSeconds = Math.max(enemy.slowSeconds ?? 0, 2.5);
      enemy.slowMultiplier = Math.min(enemy.slowMultiplier ?? 1, 0.72);
      break;
    case 'Thổ':
      enemy.attackCooldown += 0.4;
      break;
    case 'Kim':
      enemy.hp -= damage * 0.25;
      break;
    case 'Lôi':
      if ((enemy.paralysisCooldown ?? 0) <= 0){
        enemy.attackCooldown += 1;
        enemy.paralysisCooldown = ELEMENTAL_EFFECT_COOLDOWN_SECONDS;
      }
      break;
    case 'Huyết': {
      const stacks = Math.min(BLOOD_MAX_HP_STACK_CAP, (enemy.bloodMaxHpStacks ?? 0) + 1);
      if (stacks !== (enemy.bloodMaxHpStacks ?? 0)){
        enemy.bloodMaxHpStacks = stacks;
        enemy.maxHp = Math.max(1, enemy.maxHp * 0.97);
        enemy.hp = Math.min(enemy.hp, enemy.maxHp);
      }
      break;
    }
    case 'Ánh Sáng':
      enemy.lightVulnerableSeconds = Math.max(enemy.lightVulnerableSeconds ?? 0, 4);
      break;
    case 'Phong':
      if ((enemy.paralysisCooldown ?? 0) <= 0){
        enemy.x += (enemy.x < sourceX ? -1 : 1) * 90;
        enemy.slowSeconds = Math.max(enemy.slowSeconds ?? 0, 2);
        enemy.slowMultiplier = Math.min(enemy.slowMultiplier ?? 1, 0.65);
        enemy.paralysisCooldown = ELEMENTAL_EFFECT_COOLDOWN_SECONDS;
      }
      break;
  }
};

export const reduceStructureDamage = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime, attacker: Enemy | null, amount: number): number => {
    if (structure.type !== 'wall') return amount;
    const stat = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5);
    const defenseMultiplier = ((100 / (100 + Math.max(0, stat.arm ?? 0))) + (100 / (100 + Math.max(0, stat.res ?? 0)))) / 2;
    const mitigatedAmount = amount * defenseMultiplier;
    if (structure.branchLv3 !== 'slippery' || !attacker) return mitigatedAmount;
    const cooldowns = runtime.attackerCooldowns ??= new Map<string, number>();
    const key = `slippery:${attacker.id}`;
    if ((cooldowns.get(key) ?? 0) > 0 || Math.random() >= (stat.slipperyChance ?? 0)) return mitigatedAmount;
    cooldowns.set(key, stat.slipperyCooldownSeconds ?? 3);
    return mitigatedAmount * (stat.slipperyDamageMultiplier ?? 1);
  };
export const triggerWallHitEffects = (ctx: VinhDaSimulationContext, structure: PlacedStructure, site: BuildSite, runtime: StructureRuntime, attacker: Enemy): void => {
    if (structure.type !== 'wall') return;
    const stat = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5);
    const cooldowns = runtime.attackerCooldowns ??= new Map<string, number>();
    if (structure.branchLv3 === 'spike' && stat.spikeTrueDamage && damageEnemy(ctx, attacker, stat.spikeTrueDamage)) return;
    if (structure.branchLv3 === 'shock'){
      const key = `shock:${attacker.id}`;
      if ((cooldowns.get(key) ?? 0) <= 0){
        attacker.x += (attacker.side === 'left' ? -1 : 1) * (stat.shockKnockback ?? 0);
        cooldowns.set(key, stat.shockCooldownSeconds ?? 3);
      }
    }
    if (structure.branchLv5 === 'curse'){
      const key = `curse:${attacker.id}`;
      if ((cooldowns.get(key) ?? 0) <= 0){
        const loss = attacker.maxHp * (stat.curseMaxHpPercent ?? 0);
        attacker.maxHp = Math.max(1, attacker.maxHp - loss);
        attacker.hp = Math.min(attacker.hp, attacker.maxHp);
        cooldowns.set(key, stat.curseCooldownSeconds ?? 3);
      }
    }
  };
export const damageStructure = (ctx: VinhDaSimulationContext, site: BuildSite, runtime: StructureRuntime, amount: number, attacker: Enemy | null = null): boolean => {
    const structure = ctx.state.structures.get(site.id);
    const finalAmount = structure ? reduceStructureDamage(ctx, structure, runtime, attacker, amount) : amount;
    runtime.hp -= finalAmount;
    if (structure && attacker && runtime.hp > 0) triggerWallHitEffects(ctx, structure, site, runtime, attacker);
    if (runtime.hp > 0) return false;
    ctx.deleteStructure(site.id);
    ctx.renderBuildSite(site.id);
    return true;
  };
export const damageBase = (ctx: VinhDaSimulationContext, amount: number): boolean => {
    ctx.state.baseHp = Math.max(0, ctx.state.baseHp - amount);
    return ctx.state.baseHp <= 0;
  };
const getEnemyTemplate = (enemy: Enemy): EnemyTemplate => ENEMY_TEMPLATES[enemy.kind] ?? DEFAULT_ENEMY_TEMPLATE;
const getEnemyPrimaryTargetX = (ctx: VinhDaSimulationContext, enemy: Enemy): number => enemy.canFly ? ctx.state.leaderX : CRYSTAL_X;
const getEnemyMoveDirection = (ctx: VinhDaSimulationContext, enemy: Enemy, targetX = getEnemyPrimaryTargetX(ctx, enemy)): number => enemy.x < targetX ? 1 : -1;
export const getStructureAhead = (ctx: VinhDaSimulationContext, enemy: Enemy, range: number): { site: BuildSite; runtime: StructureRuntime } | null => {
    const direction = getEnemyMoveDirection(ctx, enemy);
    let closest: { site: BuildSite; runtime: StructureRuntime; distance: number } | null = null;
    for (const structure of ctx.state.structures.values()){
      if (structure.type === 'wall') continue;
      const site = ctx.getBuildSite(structure.siteId);
      if (!site) continue;
      const distance = Math.abs(enemy.x - site.x);
      const isAhead = direction > 0 ? site.x >= enemy.x : site.x <= enemy.x;
      if (!isAhead || distance > range) continue;
      const runtime = ctx.ensureStructureRuntime(structure);
      if (runtime.hp <= 0 || (closest && distance >= closest.distance)) continue;
      closest = { site, runtime, distance };
    }
    return closest ? { site: closest.site, runtime: closest.runtime } : null;
  };
const tryEnemyAttack = (enemy: Enemy, template: EnemyTemplate, attack: () => void): boolean => {
    if (enemy.attackCooldown > 0) return true;
    attack();
    enemy.attackCooldown = template.attackCooldown;
    return true;
  };
export const getEnemyEffectiveSpeed = (ctx: VinhDaSimulationContext, enemy: Enemy): number => {
    const statusMultiplier = enemy.slowSeconds && enemy.slowSeconds > 0 ? (enemy.slowMultiplier ?? 1) : 1;
    if (enemy.canFly) return enemy.baseSpeed * statusMultiplier;
    for (const siteId of ctx.structureSiteIdsOfType('swamp')){
      const site = ctx.getBuildSite(siteId);
      if (site && Math.abs(enemy.x - site.x) <= SWAMP_RADIUS){
        if (enemy.weight >= 1 && enemy.weight < 2) return enemy.baseSpeed * 0.5 * statusMultiplier;
        if (enemy.weight >= 2 && enemy.weight < 3) return enemy.baseSpeed * 0.75 * statusMultiplier;
        return enemy.baseSpeed * statusMultiplier;
      }
    }
    return enemy.baseSpeed * statusMultiplier;
  };
const moveEnemyToward = (ctx: VinhDaSimulationContext, enemy: Enemy, targetX: number, dt: number, speed = getEnemyEffectiveSpeed(ctx, enemy)): void => {
    enemy.x += getEnemyMoveDirection(ctx, enemy, targetX) * speed * dt;
  };
export const attackEnemyTarget = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, targetX: number, dt: number): void => {
    if (Math.abs(enemy.x - targetX) <= template.attackRange){
      tryEnemyAttack(enemy, template, () => { damageBase(ctx, template.damage); });
      return;
    }
    moveEnemyToward(ctx, enemy, targetX, dt);
  };
export const updateMeleeBasicEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, dt: number): void => {
    const wall = getBlockingWall(ctx, enemy);
    if (wall){
      tryEnemyAttack(enemy, template, () => { damageStructure(ctx, wall.site, wall.runtime, template.damage, enemy); });
      return;
    }
    attackEnemyTarget(ctx, enemy, template, getEnemyPrimaryTargetX(ctx, enemy), dt);
  };
export const updateSuicideBomberEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, dt: number): void => {
    const wall = getBlockingWall(ctx, enemy);
    if (wall){
      tryEnemyAttack(enemy, template, () => {
        applyContaminationHit(ctx, enemy);
        damageStructure(ctx, wall.site, wall.runtime, template.damage, enemy);
      });
      return;
    }
    if (Math.abs(enemy.x - CRYSTAL_X) <= template.attackRange){
      tryEnemyAttack(enemy, template, () => {
        applyContaminationHit(ctx, enemy);
        damageBase(ctx, template.damage);
      });
      return;
    }
    moveEnemyToward(ctx, enemy, CRYSTAL_X, dt);
  };
export const updateFlyingEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, index: number, dt: number): void => {
    const targetX = getEnemyPrimaryTargetX(ctx, enemy);
    const distance = Math.abs(enemy.x - targetX);
    if (distance < 3 * 100){
      enemy.birdAccelerating = false;
      moveEnemyToward(ctx, enemy, enemy.x + (enemy.x < targetX ? -1 : 1) * template.attackRange, dt, enemy.flySpeed);
      return;
    }
    enemy.birdAccelerating = distance <= template.attackRange;
    if (distance <= template.attackRange && enemy.birdAccelerating){
      damageBase(ctx, distance <= 6 * 100 ? 1.2 : distance <= 9 * 100 ? 2 : 2.5);
      removeEnemyAt(ctx, index, false);
      return;
    }
    moveEnemyToward(ctx, enemy, targetX, dt, enemy.birdAccelerating ? 3.5 * 100 : enemy.flySpeed);
  };
export const updateDarkMageEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, dt: number): void => {
    const wall = getBlockingWall(ctx, enemy);
    if (wall){
      tryEnemyAttack(enemy, template, () => { damageStructure(ctx, wall.site, wall.runtime, template.damage, enemy); });
      return;
    }
    if (Math.abs(enemy.x - CRYSTAL_X) > template.attackRange){
      moveEnemyToward(ctx, enemy, CRYSTAL_X, dt);
      return;
    }
    enemy.mageOrbTimer = (enemy.mageOrbTimer ?? 0) + dt;
    while (enemy.mageOrbTimer >= 2 && (enemy.mageOrbs ?? 0) < 3){
      enemy.mageOrbTimer -= 2;
      enemy.mageOrbs = (enemy.mageOrbs ?? 0) + 1;
    }
    if ((enemy.mageOrbs ?? 0) >= 3){
      tryEnemyAttack(enemy, template, () => {
        damageBase(ctx, Math.max(enemy.atk, enemy.wil) * (enemy.mageOrbs ?? 3));
        enemy.mageOrbs = 0;
        enemy.mageOrbTimer = 0;
      });
    }
  };
export const damageDragonStructureCounter = (ctx: VinhDaSimulationContext, site: BuildSite, runtime: StructureRuntime): boolean => {
    const structure = ctx.state.structures.get(site.id);
    if (!structure || structure.type === 'wall') return false;
    runtime.dragonHitCount = (runtime.dragonHitCount ?? 0) + 1;
    if (runtime.dragonHitCount < structure.level) return false;
    ctx.deleteStructure(site.id);
    ctx.renderBuildSite(site.id);
    return true;
  };
const getDragonDamage = (enemy: Enemy, multiplier = 1): number => {
    const rageMultiplier = enemy.hp <= enemy.maxHp * 0.3 ? 1.1 : 1;
    return Math.max(enemy.atk, enemy.wil) * rageMultiplier * multiplier;
  };
const applyDragonBreath = (ctx: VinhDaSimulationContext, enemy: Enemy, damage: number, applyDestroy: boolean): void => {
    const direction = getEnemyMoveDirection(ctx, enemy, CRYSTAL_X);
    if (direction > 0 ? CRYSTAL_X >= enemy.x : CRYSTAL_X <= enemy.x){
      if (Math.abs(enemy.x - CRYSTAL_X) <= enemy.aoeRadius) damageBase(ctx, damage);
    }
    for (let i = ctx.state.enemies.length - 1; i >= 0; i -= 1){
      const target = ctx.state.enemies[i];
      if (!target || target.id === enemy.id) continue;
      const ahead = direction > 0 ? target.x >= enemy.x : target.x <= enemy.x;
      if (!ahead || Math.abs(target.x - enemy.x) > enemy.aoeRadius) continue;
      if (damageEnemy(ctx, target, damage)) removeEnemyAt(ctx, i, true);
    }
    const structureAhead = getStructureAhead(ctx, enemy, applyDestroy ? 3 * 100 : enemy.aoeRadius);
    if (applyDestroy && structureAhead && (enemy.dragonDestroyCooldown ?? 0) <= 0){
      damageDragonStructureCounter(ctx, structureAhead.site, structureAhead.runtime);
      enemy.dragonDestroyCooldown = 10;
    }
  };
export const updateResentfulDragonEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, dt: number): void => {
    const inBreathRange = Math.abs(enemy.x - CRYSTAL_X) <= template.aoeRadius || Boolean(getStructureAhead(ctx, enemy, template.aoeRadius));
    enemy.dragonUltimateCooldown = Math.max(0, (enemy.dragonUltimateCooldown ?? 20) - dt);
    enemy.dragonDestroyCooldown = Math.max(0, (enemy.dragonDestroyCooldown ?? 0) - dt);
    if (inBreathRange){
      if ((enemy.dragonUltimateCooldown ?? 0) <= 0){
        applyDragonBreath(ctx, enemy, getDragonDamage(enemy, 2), true);
        enemy.dragonUltimateCooldown = 20;
        enemy.attackCooldown = template.attackCooldown;
        return;
      }
      tryEnemyAttack(enemy, template, () => { applyDragonBreath(ctx, enemy, getDragonDamage(enemy), true); });
      return;
    }
    moveEnemyToward(ctx, enemy, CRYSTAL_X, dt, enemy.baseSpeed);
  };
const isUnitInLandmineTriggerRadius = (ctx: VinhDaSimulationContext, site: BuildSite): boolean => (
    Math.abs(ctx.state.leaderX - site.x) <= LANDMINE_TRIGGER_RADIUS
    || ctx.state.enemies.some(enemy => Math.abs(enemy.x - site.x) <= LANDMINE_TRIGGER_RADIUS)
  );
export const explodeLandmine = (ctx: VinhDaSimulationContext, site: BuildSite): void => {
    for (let i = ctx.state.enemies.length - 1; i >= 0; i -= 1){
      const enemy = ctx.state.enemies[i];
      if (enemy && Math.abs(enemy.x - site.x) <= LANDMINE_BLAST_RADIUS && damageEnemy(ctx, enemy, LANDMINE_TRUE_DAMAGE)) removeEnemyAt(ctx, i, true);
    }
    ctx.deleteStructure(site.id);
    ctx.renderBuildSite(site.id);
  };
export const updateEnemies = (ctx: VinhDaSimulationContext, dt: number): void => {
    if (ctx.state.dayNightPhase === 'night') ctx.state.enemySpawnTimer += dt;
    else ctx.state.enemySpawnTimer = 0;
    ctx.state.leaderAttackCooldown = Math.max(0, ctx.state.leaderAttackCooldown - dt);
    while (ctx.state.dayNightPhase === 'night' && ctx.state.enemySpawnTimer >= ENEMY_SPAWN_INTERVAL){
      ctx.state.enemySpawnTimer -= ENEMY_SPAWN_INTERVAL;
      spawnEnemy(ctx, ctx.state.nextEnemyId % 2 === 0 ? 'left' : 'right');
    }

    for (let i = ctx.state.enemies.length - 1; i >= 0; i -= 1){
      const enemy = ctx.state.enemies[i];
      if (!enemy) continue;
      enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
      enemy.paralysisCooldown = Math.max(0, (enemy.paralysisCooldown ?? 0) - dt);
      enemy.slowSeconds = Math.max(0, (enemy.slowSeconds ?? 0) - dt);
      enemy.lightVulnerableSeconds = Math.max(0, (enemy.lightVulnerableSeconds ?? 0) - dt);
      if ((enemy.burnSeconds ?? 0) > 0){
        enemy.burnSeconds = Math.max(0, (enemy.burnSeconds ?? 0) - dt);
        if (damageEnemy(ctx, enemy, (enemy.burnDps ?? 0) * dt)){ removeEnemyAt(ctx, i, true); continue; }
      }
      if (enemy.regen){
        enemy.regenTimer = (enemy.regenTimer ?? 0) + dt;
        const interval = enemy.kind === 'resentfulDragon' ? 2 : 5;
        while (enemy.regenTimer >= interval){
          enemy.regenTimer -= interval;
          const amount = enemy.kind === 'resentfulDragon' ? enemy.maxHp * 0.03 : enemy.tier === 1.3 ? 3 : enemy.tier === 1.2 ? 2 : 1;
          enemy.hp = Math.min(enemy.maxHp, enemy.hp + amount);
        }
      }y
      if ((enemy.bleedSeconds ?? 0) > 0){
        enemy.bleedSeconds = Math.max(0, (enemy.bleedSeconds ?? 0) - dt);
        if (damageEnemy(ctx, enemy, enemy.maxHp * (enemy.bleedMaxHpDpsPercent ?? 0) * dt)){ removeEnemyAt(ctx, i, true); continue; }
      }
      const template = getEnemyTemplate(enemy);
      switch (enemy.kind){
        case 'suicideBomber':
          updateSuicideBomberEnemy(ctx, enemy, template, dt);
          break;
        case 'mutantBird':
          updateFlyingEnemy(ctx, enemy, template, i, dt);
          break;
        case 'darkMage':
          updateDarkMageEnemy(ctx, enemy, template, dt);
          break;
        case 'resentfulDragon':
          updateResentfulDragonEnemy(ctx, enemy, template, dt);
          break;
        case 'twisted':
        case 'crawler':
        case 'madDog':
        case 'ironMan':
          updateMeleeBasicEnemy(ctx, enemy, template, dt);
          break;
      }
      if (!ctx.state.enemies.includes(enemy)) continue;
      if (ctx.state.leaderAttackCooldown === 0 && Math.abs(enemy.x - ctx.state.leaderX) <= LEADER_ATTACK_RANGE){
        ctx.state.leaderAttackCooldown = LEADER_BASIC_ATTACK_COOLDOWN_SECONDS;
        if (damageEnemy(ctx, enemy, LEADER_BASIC_ATTACK_DAMAGE)) removeEnemyAt(ctx, i, true);
      }
    }
  };
export const updateDayNightTimer = (ctx: VinhDaSimulationContext, dt: number): void => {
    ctx.state.phaseRemainingSeconds -= dt;
    while (ctx.state.phaseRemainingSeconds <= 0){
      ctx.state.phaseRemainingSeconds += DAY_DURATION_SECONDS;
      ctx.state.dayNightPhase = ctx.state.dayNightPhase === 'night' ? 'day' : 'night';
      if (ctx.state.dayNightPhase === 'day') clearEnemiesWithoutReward(ctx);
    }
    ctx.renderDayNightTimer();
  };
export const updateStructureRuntimeTimers = (ctx: VinhDaSimulationContext, runtime: StructureRuntime, dt: number): void => {
  runtime.biochemicalCooldown = Math.max(0, (runtime.biochemicalCooldown ?? 0) - dt);
  runtime.prayerTimer = Math.max(0, (runtime.prayerTimer ?? 0) - dt);
  runtime.contaminationCleanseTimer = Math.max(0, (runtime.contaminationCleanseTimer ?? 0) - dt);
  runtime.soldierSpawnTimer = Math.max(0, (runtime.soldierSpawnTimer ?? 0) - dt);
  runtime.emergencyHealCooldown = Math.max(0, (runtime.emergencyHealCooldown ?? 0) - dt);
    for (const [key, remaining] of runtime.attackerCooldowns ?? []){
      const next = Math.max(0, remaining - dt);
      if (next > 0) runtime.attackerCooldowns?.set(key, next);
      else runtime.attackerCooldowns?.delete(key);
    }
  };
const getWallSide = (site: BuildSite): Side | null => {
    if (site.x <= CASTLE_OUTER_LEFT) return 'left';
    if (site.x >= CASTLE_OUTER_RIGHT) return 'right';
    return null;
  };
const findLinkedWall = (ctx: VinhDaSimulationContext, source: PlacedStructure, sourceSite: BuildSite): PlacedStructure | null => {
    const sourceSide = getWallSide(sourceSite);
    if (!sourceSide) return null;
    let closest: { structure: PlacedStructure; distance: number } | null = null;
    for (const siteId of ctx.structureSiteIdsOfType('wall')){
      if (siteId === source.siteId) continue;
      const candidate = ctx.state.structures.get(siteId);
      const candidateSite = ctx.getBuildSite(siteId);
      if (!candidate || !candidateSite || getWallSide(candidateSite) === sourceSide) continue;
      const distance = Math.abs(candidateSite.x - sourceSite.x);
      if (!closest || distance < closest.distance) closest = { structure: candidate, distance };
    }
    return closest?.structure ?? null;
  };
export const updateWallLink = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime): void => {
    if (structure.type !== 'wall' || structure.level < 5 || structure.branchLv5 !== 'link') return;
    const site = ctx.getBuildSite(structure.siteId);
    if (!site) return;
    const linked = findLinkedWall(ctx, structure, site);
    if (!linked) return;
    const stat = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5);
    const sourceMaxHp = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5).hp;
    const linkedRuntime = ctx.ensureStructureRuntime(linked);
    runtime.linkedWallSiteId = linked.siteId;
    linkedRuntime.linkedMaxHpBonus = (linkedRuntime.linkedMaxHpBonus ?? 0) + sourceMaxHp * (stat.linkedHpBonusPercent ?? 0);
    linkedRuntime.linkedRegenBonus = (linkedRuntime.linkedRegenBonus ?? 0) + (stat.hpRegen ?? 0) * (stat.linkedRegenShare ?? 0);
};
export const updateWallRegeneration = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime, dt: number): void => {
    if (structure.type !== 'wall') return;
    const maxHp = ctx.getStructureMaxHp(structure);
    const regen = (getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5).hpRegen ?? 0) + (runtime.linkedRegenBonus ?? 0);
    runtime.hp = Math.min(maxHp, runtime.hp + regen * dt);
  };
export const updateBiochemicalWall = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime): void => {
    if (structure.type !== 'wall' || structure.level < 5 || structure.branchLv5 !== 'biochemical' || (runtime.biochemicalCooldown ?? 0) > 0) return;
    const site = ctx.getBuildSite(structure.siteId);
    if (!site) return;
    const stat = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5);
    const candidates = ctx.state.enemies
      .map((enemy, index) => ({ enemy, index, sort: Math.random() }))
      .filter(item => Math.abs(item.enemy.x - site.x) <= (stat.biochemicalRange ?? 0))
      .sort((a, b) => a.sort - b.sort)
      .slice(0, stat.biochemicalMaxTargets ?? 3)
      .sort((a, b) => b.index - a.index);
    if (candidates.length <= 0) return;
    for (const { enemy, index } of candidates){
      runtime.hp = Math.min(ctx.getStructureMaxHp(structure), runtime.hp + Math.max(0, enemy.hp));
      removeEnemyAt(ctx, index, false);
    }
    runtime.biochemicalCooldown = stat.biochemicalCooldownSeconds ?? 5;
  };


const canTriggerSpikeTrap = (enemy: Enemy): boolean => enemy.weight >= SPIKE_TRAP_MIN_WEIGHT && enemy.weight < SPIKE_TRAP_MAX_WEIGHT_EXCLUSIVE;
const updateSpikeTrap = (ctx: VinhDaSimulationContext, site: BuildSite): void => {
  for (const enemy of ctx.state.enemies){
    if (enemy.canFly || !canTriggerSpikeTrap(enemy) || Math.abs(enemy.x - site.x) > SPIKE_TRAP_RADIUS) continue;
    enemy.slowSeconds = Math.max(enemy.slowSeconds ?? 0, SPIKE_TRAP_SLOW_SECONDS);
    enemy.slowMultiplier = Math.min(enemy.slowMultiplier ?? 1, SPIKE_TRAP_SLOW_MULTIPLIER);
    enemy.bleedSeconds = Math.max(enemy.bleedSeconds ?? 0, SPIKE_TRAP_BLEED_SECONDS);
    enemy.bleedMaxHpDpsPercent = Math.max(enemy.bleedMaxHpDpsPercent ?? 0, SPIKE_TRAP_BLEED_MAX_HP_PER_SECOND);
  }
};
const updateAntiAirCannon = (ctx: VinhDaSimulationContext, structure: PlacedStructure, site: BuildSite, runtime: StructureRuntime, dt: number): void => {
  if (structure.type !== 'antiAirCannon') return;
  const stat = getStructureLevelStat('antiAirCannon', structure.level);
  runtime.cooldown = Math.max(0, runtime.cooldown - dt);
  if ((runtime.burstShotsRemaining ?? 0) <= 0 && runtime.cooldown <= 0) runtime.burstShotsRemaining = stat.burstShotCount ?? 1;
  if (runtime.cooldown > 0 || (runtime.burstShotsRemaining ?? 0) <= 0) return;
  const target = ctx.state.enemies.find(enemy => (structure.level >= 6 || enemy.canFly) && Math.abs(enemy.x - site.x) <= (stat.range ?? 0));
  if (!target) return;
  runtime.burstShotsRemaining = Math.max(0, (runtime.burstShotsRemaining ?? 1) - 1);
  runtime.cooldown = (runtime.burstShotsRemaining ?? 0) > 0 ? (stat.cooldownSeconds ?? DEFAULT_STRUCTURE_COOLDOWN) : (stat.reloadSeconds ?? stat.cooldownSeconds ?? DEFAULT_STRUCTURE_COOLDOWN);
  if (damageEnemy(ctx, target, stat.damage ?? 0)) removeEnemyAt(ctx, ctx.state.enemies.indexOf(target), true);
};
const updateGravityCannon = (ctx: VinhDaSimulationContext, structure: PlacedStructure, site: BuildSite, runtime: StructureRuntime, dt: number): void => {
  if (structure.type !== 'gravityCannon') return;
  const stat = getStructureLevelStat('gravityCannon', structure.level);
  runtime.cooldown = Math.max(0, runtime.cooldown - dt);
  if (structure.level >= 6 && runtime.gravityEnabled === undefined) runtime.gravityEnabled = true;
  if (structure.level >= 6 && runtime.gravityEnabled === false) return;
  if (runtime.cooldown > 0) return;
  const center = ctx.state.enemies.find(enemy => Math.abs(enemy.x - site.x) <= (stat.range ?? 0) && enemy.weight <= (stat.maxAffectedWeight ?? 0))?.x;
  if (center === undefined) return;
  for (const enemy of ctx.state.enemies){
    if (enemy.weight > (stat.maxAffectedWeight ?? 0) || Math.abs(enemy.x - center) > (stat.pullRadius ?? 0)) continue;
    enemy.x += (center - enemy.x) * Math.min(1, (stat.pullStrength ?? 0) / Math.max(1, Math.abs(center - enemy.x)) * dt);
    enemy.slowSeconds = Math.max(enemy.slowSeconds ?? 0, 1);
    enemy.slowMultiplier = Math.min(enemy.slowMultiplier ?? 1, 0.65);
  }
  runtime.cooldown = stat.cooldownSeconds ?? DEFAULT_STRUCTURE_COOLDOWN;
};

const updateBaseSupport = (ctx: VinhDaSimulationContext, dt: number): void => {
  const stat = getBaseStat(ctx);
  if ((stat.healPerSecond ?? 0) > 0) healBase(ctx, (stat.healPerSecond ?? 0) * dt);
  for (const structure of ctx.state.structures.values()){
    const runtime = ctx.ensureStructureRuntime(structure);
    if ((runtime.emergencyHealCooldown ?? 0) > 0) continue;
    if ((stat.emergencyHealPercent ?? 0) > 0 && ctx.state.baseHp > 0 && ctx.state.baseHp <= stat.hp * 0.2){
      healBase(ctx, stat.hp * (stat.emergencyHealPercent ?? 0));
      runtime.emergencyHealCooldown = stat.emergencyCooldownSeconds ?? 60;
      break;
    }
  }
};
const updateChurch = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime): void => {
  if (structure.type !== 'church') return;
  const stat = getStructureLevelStat('church', structure.level);
  if ((runtime.prayerTimer ?? 0) <= 0){
    healBase(ctx, 1 + structure.level);
    runtime.prayerTimer = stat.prayerIntervalSeconds ?? 20;
  }
  if ((runtime.contaminationCleanseTimer ?? 0) <= 0){
    ctx.state.contamination = Math.max(0, (ctx.state.contamination ?? 0) - structure.level);
    runtime.contaminationCleanseTimer = stat.cleanseContaminationSeconds ?? 120;
  }
};
const updateBarracks = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime): void => {
  if (structure.type !== 'barracks') return;
  const site = ctx.getBuildSite(structure.siteId);
  if (!site) return;
  const stat = getStructureLevelStat('barracks', structure.level);
  runtime.soldiers ??= [];
  runtime.soldiers = runtime.soldiers.filter(soldier => soldier.hp > 0).slice(0, stat.soldierCap ?? 0);
  if (runtime.soldiers.length >= (stat.soldierCap ?? 0) || (runtime.soldierSpawnTimer ?? 0) > 0) return;
  runtime.nextSoldierId = (runtime.nextSoldierId ?? 0) + 1;
  runtime.soldiers.push({ id: runtime.nextSoldierId, siteId: structure.siteId, rank: stat.soldierRank ?? 1, hp: 8 + (stat.soldierRank ?? 1) * 4, x: site.x, side: runtime.nextSoldierId % 2 === 0 ? 'left' : 'right', attackCooldown: 0, ultimateReady: Boolean(stat.ultimatePermission) });
  runtime.soldierSpawnTimer = stat.soldierSpawnSeconds ?? 10;
};

export const updateStructures = (ctx: VinhDaSimulationContext, dt: number): void => {
    for (const structure of ctx.state.structures.values()){
      const runtime = ctx.ensureStructureRuntime(structure);
      updateStructureRuntimeTimers(ctx, runtime, dt);
      runtime.linkedWallSiteId = null;
      runtime.linkedMaxHpBonus = 0;
      runtime.linkedRegenBonus = 0;
    }
    for (const structure of ctx.state.structures.values()){
      const runtime = ctx.ensureStructureRuntime(structure);
      updateWallLink(ctx, structure, runtime);
    }
  updateBaseSupport(ctx, dt);
    for (const structure of ctx.state.structures.values()){
      const runtime = ctx.ensureStructureRuntime(structure);
      updateWallRegeneration(ctx, structure, runtime, dt);
      updateBiochemicalWall(ctx, structure, runtime);
      updateChurch(ctx, structure, runtime);
      updateBarracks(ctx, structure, runtime);
      const site = ctx.getBuildSite(structure.siteId);
      if (!site) continue;
      if (structure.type === 'spikeTrap') updateSpikeTrap(ctx, site);
      updateAntiAirCannon(ctx, structure, site, runtime, dt);
      updateGravityCannon(ctx, structure, site, runtime, dt);
    }
    for (const type of ['watchtower', 'elementalTower'] as const){
      for (const siteId of ctx.structureSiteIdsOfType(type)){
        const structure = ctx.state.structures.get(siteId);
        if (!structure || (structure.type !== type && structure.mountedStructure !== type)) continue;
        const site = ctx.getBuildSite(structure.siteId);
        if (!site) continue;
        const runtime = ctx.ensureStructureRuntime(structure);
        runtime.cooldown = Math.max(0, runtime.cooldown - dt);
        if (runtime.cooldown > 0) continue;
        const stat = getStructureLevelStat(type, structure.type === type ? structure.level : 1, structure.branchLv3, structure.branchLv5, structure.element);
        const targets = ctx.state.enemies
          .filter(enemy => Math.abs(enemy.x - site.x) <= (stat.range ?? 0))
          .slice(0, stat.maxTargets ?? 1);
        if (targets.length <= 0) continue;
        runtime.cooldown = stat.cooldownSeconds ?? DEFAULT_STRUCTURE_COOLDOWN;
        for (const target of targets){
          const bonus = target.lightVulnerableSeconds && target.lightVulnerableSeconds > 0 ? 1.2 : 1;
          if (stat.element) applyElementEffect(ctx, target, stat.element, stat.damage ?? 0, site.x);
          if (damageEnemy(ctx, target, (stat.damage ?? 0) * bonus)) removeEnemyAt(ctx, ctx.state.enemies.indexOf(target), true);
        }
      }
    }

    for (const siteId of [...ctx.structureSiteIdsOfType('landmine')]){
      const structure = ctx.state.structures.get(siteId);
      const site = ctx.getBuildSite(siteId);
      if (!structure || !site) continue;
      const runtime = ctx.ensureStructureRuntime(structure);
      if (!runtime.armed && isUnitInLandmineTriggerRadius(ctx, site)){
        runtime.armed = true;
        runtime.fuse = LANDMINE_FUSE_SECONDS;
      }
      if (!runtime.armed) continue;
      runtime.fuse = Math.max(0, (runtime.fuse ?? LANDMINE_FUSE_SECONDS) - dt);
      if (runtime.fuse <= 0) explodeLandmine(ctx, site);
    }
  };
  