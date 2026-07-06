import {
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
  LEADER_ATTACK_RANGE,
  LEADER_BASIC_ATTACK_COOLDOWN_SECONDS,
  LEADER_BASIC_ATTACK_DAMAGE,
  SWAMP_RADIUS,
  WORLD_WIDTH
} from './constants.ts';
import { DEFAULT_ENEMY_TEMPLATE, ENEMY_TEMPLATES } from './enemies.ts';
import type { EnemyKind, EnemyTemplate } from './enemies.ts';
import { getStructureLevelStat } from './structures.ts';
import type { StructureType } from './structures.ts';
import type { BuildSite, Enemy, PlacedStructure, Side, StructureRuntime } from './types.ts';

export const DAY_DURATION_SECONDS = 300;
export type DayNightPhase = 'day' | 'night';

export interface VinhDaSimulationState {
  bloodSealStone: number;
  baseHp: number;
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
      weight: template.weight,
      attackCooldown: template.attackCooldown,
      canFly: template.canFly,
      side
    });
    ctx.state.nextEnemyId += 1;
  };
export const removeEnemyAt = (ctx: VinhDaSimulationContext, index: number, reward: boolean): void => {
    const [enemy] = ctx.state.enemies.splice(index, 1);
    if (!enemy) return;
    ctx.removeEnemyElement(enemy.id);
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
export const reduceStructureDamage = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime, attacker: Enemy | null, amount: number): number => {
    if (structure.type !== 'wall' || structure.branchLv3 !== 'slippery' || !attacker) return amount;
    const stat = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5);
    const cooldowns = runtime.attackerCooldowns ??= new Map<string, number>();
    const key = `slippery:${attacker.id}`;
    if ((cooldowns.get(key) ?? 0) > 0 || Math.random() >= (stat.slipperyChance ?? 0)) return amount;
    cooldowns.set(key, stat.slipperyCooldownSeconds ?? 3);
    return amount * (stat.slipperyDamageMultiplier ?? 1);
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
    if (enemy.canFly) return enemy.baseSpeed;
    for (const siteId of ctx.structureSiteIdsOfType('swamp')){
      const site = ctx.getBuildSite(siteId);
      if (site && Math.abs(enemy.x - site.x) <= SWAMP_RADIUS){
        if (enemy.weight <= 1) return enemy.baseSpeed * 0.5;
        if (enemy.weight === 2) return enemy.baseSpeed * 0.75;
        return enemy.baseSpeed;
      }
    }
    return enemy.baseSpeed;
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
export const updateSuicideBomberEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, index: number, dt: number): void => {
    const wall = getBlockingWall(ctx, enemy);
    if (wall && Math.abs(enemy.x - wall.site.x) <= template.attackRange){
      damageStructure(ctx, wall.site, wall.runtime, template.damage, enemy);
      removeEnemyAt(ctx, index, false);
      return;
    }
    if (Math.abs(enemy.x - CRYSTAL_X) <= template.attackRange){
      damageBase(ctx, template.damage);
      removeEnemyAt(ctx, index, false);
      return;
    }
    moveEnemyToward(ctx, enemy, CRYSTAL_X, dt);
  };
export const updateFlyingEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, index: number, dt: number): void => {
    const targetX = getEnemyPrimaryTargetX(ctx, enemy);
    if (Math.abs(enemy.x - targetX) <= template.attackRange){
      damageBase(ctx, template.damage);
      removeEnemyAt(ctx, index, false);
      return;
    }
    moveEnemyToward(ctx, enemy, targetX, dt, enemy.baseSpeed);
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
        damageBase(ctx, template.damage * (enemy.mageOrbs ?? 3));
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
export const updateResentfulDragonEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, dt: number): void => {
    const structureAhead = getStructureAhead(ctx, enemy, template.attackRange);
    if (Math.abs(enemy.x - CRYSTAL_X) <= template.attackRange || structureAhead){
      tryEnemyAttack(enemy, template, () => {
        if (Math.abs(enemy.x - CRYSTAL_X) <= template.attackRange) damageBase(ctx, template.damage);
        if (structureAhead) damageDragonStructureCounter(ctx, structureAhead.site, structureAhead.runtime);
      });
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
      const template = getEnemyTemplate(enemy);
      switch (enemy.kind){
        case 'suicideBomber':
          updateSuicideBomberEnemy(ctx, enemy, template, i, dt);
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
    for (const [key, remaining] of runtime.attackerCooldowns ?? []){
      const next = Math.max(0, remaining - dt);
      if (next > 0) runtime.attackerCooldowns?.set(key, next);
      else runtime.attackerCooldowns?.delete(key);
    }
  };
export const updateWallRegeneration = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime, dt: number): void => {
    if (structure.type !== 'wall') return;
    const maxHp = ctx.getStructureMaxHp(structure);
    const regen = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5).hpRegen ?? 0;
    runtime.hp = Math.min(maxHp, runtime.hp + regen * dt);
  };
export const updateStructures = (ctx: VinhDaSimulationContext, dt: number): void => {
    for (const structure of ctx.state.structures.values()){
      const runtime = ctx.ensureStructureRuntime(structure);
      updateStructureRuntimeTimers(ctx, runtime, dt);
      updateWallRegeneration(ctx, structure, runtime, dt);
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
        const stat = getStructureLevelStat(type, structure.type === type ? structure.level : 1);
        const target = ctx.state.enemies.find(enemy => Math.abs(enemy.x - site.x) <= (stat.range ?? 0));
        if (!target) continue;
        runtime.cooldown = stat.cooldownSeconds ?? DEFAULT_STRUCTURE_COOLDOWN;
        if (damageEnemy(ctx, target, stat.damage ?? 0)) removeEnemyAt(ctx, ctx.state.enemies.indexOf(target), true);
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
  