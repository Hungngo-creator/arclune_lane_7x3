import { ROSTER, getMetaById } from '../../catalog.ts';
import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import type { MainMenuShell } from '../main-menu/types.ts';
import { getFrameRateCap } from '../../utils/frame-rate.ts';
import { isAudioEnabled } from '../../utils/audio-settings.ts';
import { createRngState } from '../../utils/rng.ts';

import {
  BUILD_RANGE,
  BUILD_SITE_RENDER_BUFFER,
  BUILD_SITE_RENDER_THRESHOLD,
  BUILD_SITE_EDGE_PADDING,
  CASTLE_LEFT,
  CASTLE_OUTER_LEFT,
  CASTLE_OUTER_RIGHT,
  CASTLE_TOWER_OFFSET,
  CASTLE_TOWER_WIDTH,
  CASTLE_WIDTH,
  CRYSTAL_X,
  DEFAULT_STRUCTURE_COOLDOWN,
  GROUND_PERCENT,
  LEADER_EDGE_PADDING_LEFT,
  LEADER_EDGE_PADDING_RIGHT,
  LEADER_SPEED,
  LEADER_START_X,
  LEADER_WIDTH,
  STYLE_ID,
  WORLD_WIDTH
} from './constants.ts';
import {
  BUILD_NODE_OPTIONS,
  GROUND_BUILD_NODE_OPTIONS,
  BUILD_SITES,
  UPGRADE_NODE_LABEL,
  ELEMENTAL_TOWER_ELEMENTS,
  getBaseLevelStat,
  getStructureUpgradeCost,
  getStructureLevelStat,
  isStructureAllowedOnBuildSite,
} from './structures.ts';
import type { BaseBranchLv3, ElementalTowerElement, StructureType, WallBranchLv3, WallBranchLv5 } from './structures.ts';
import {
  DAY_DURATION_SECONDS,
  getScaledThreatBudget,
  getVinhDaWaveConfig,
  damageBase as runtimeDamageBase,
  damageStructure as runtimeDamageStructure,
  clearEnemiesWithoutReward as runtimeClearEnemiesWithoutReward,
  removeEnemyAt as runtimeRemoveEnemyAt,
  spawnWaveEnemy as runtimeSpawnWaveEnemy,
  updateDayNightTimer as runtimeUpdateDayNightTimer,
  updateEnemies as runtimeUpdateEnemies,
  updateStructures as runtimeUpdateStructures,
  collectDroppedResources as runtimeCollectDroppedResources,
  activateTeleportRetreat,
  canActivateTeleportRetreat,
  TELEPORT_RETREAT_COST,
  TELEPORT_BANKED_RESOURCE_KEEP_RATIO,
  getLivingTerritoryWallBounds,
  isXInLivingTerritory,
  getBaseX,
  canStartEscort,
  startEscort,
} from './simulation.ts';
import type { DayNightPhase, VinhDaSimulationContext, VinhDaSimulationState } from './simulation.ts';
import type { BuildSite, DroppedResource, ElementalRegion, Enemy, EnemyPortal, PlacedStructure, Side, StructureRuntime, VinhDaStatusCollection } from './types.ts';
import { getResourceLabel, isTieredVinhDaResource } from './economy/resources.ts';
import type { TieredAmount, VinhDaResourceId } from './economy/resources.ts';
import {
  createElementalRegionRandom,
  createElementalRegions,
  getElementalRegionParticleCount,
  getVinhDaMapTier,
  ELEMENTAL_REGION_RENDER_BUFFER
} from './elemental-regions.ts';

type WeatherType = 'clear' | 'drizzle' | 'rain' | 'heavyRain' | 'storm' | 'fog' | 'bloodMoon';

interface RenderContext {
  root: HTMLElement;
  shell?: MainMenuShell | null;
  params?: Record<string, unknown> | null;
}

const STORM_LOOP_SRC: string | null = null;

type BrowserAudioContext = AudioContext & { createGain(): GainNode };

function createAudioContext(): BrowserAudioContext | null {
  const AudioContextCtor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return AudioContextCtor ? new AudioContextCtor() as BrowserAudioContext : null;
}

function createVinhDaAudioController(): { unlock: () => void; syncWeather: (weather: WeatherType) => void; playThunder: () => void; destroy: () => void } {
  let unlocked = false;
  let context: BrowserAudioContext | null = null;
  let stormLoop: HTMLAudioElement | null = null;
  let rainNoise: { source: AudioBufferSourceNode; gain: GainNode } | null = null;

  const ensureContext = (): BrowserAudioContext | null => {
    if (!context) context = createAudioContext();
    return context;
  };
  const canPlay = (): boolean => unlocked && isAudioEnabled();
  const ensureStormLoop = (): HTMLAudioElement | null => {
    if (!STORM_LOOP_SRC) return null;
    if (!stormLoop){
      stormLoop = new Audio(STORM_LOOP_SRC);
      stormLoop.loop = true;
      stormLoop.volume = 0.28;
    }
    return stormLoop;
  };
  const stopStormLoop = (): void => {
    if (!stormLoop) return;
    stormLoop.pause();
    stormLoop.currentTime = 0;
  };
  const stopRainNoise = (): void => {
    if (!rainNoise) return;
    rainNoise.source.stop();
    rainNoise.source.disconnect();
    rainNoise.gain.disconnect();
    rainNoise = null;
  };
  const syncProceduralRain = (nextWeather: WeatherType): void => {
    const volume = nextWeather === 'storm' ? 0.16 : nextWeather === 'heavyRain' ? 0.1 : nextWeather === 'rain' ? 0.055 : nextWeather === 'drizzle' ? 0.025 : 0;
    if (!canPlay() || volume <= 0){
      stopRainNoise();
      return;
    }
    const audio = ensureContext();
    if (!audio) return;
    void audio.resume();
    if (!rainNoise){
      const buffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
      const source = audio.createBufferSource();
      const gain = audio.createGain();
      source.buffer = buffer;
      source.loop = true;
      gain.gain.value = volume;
      source.connect(gain);
      gain.connect(audio.destination);
      source.start();
      rainNoise = { source, gain };
    } else {
      rainNoise.gain.gain.setTargetAtTime(volume, audio.currentTime, 0.08);
    }
  };

  return {
    unlock(){
      if (unlocked) return;
      unlocked = true;
      void ensureContext()?.resume();
    },
    syncWeather(nextWeather: WeatherType){
      const loop = ensureStormLoop();
      syncProceduralRain(nextWeather);
      if (!loop) return;
      if (nextWeather === 'storm' && canPlay()){
        void loop.play();
      } else {
        loop.pause();
      }
    },
    playThunder(){
      if (!canPlay()) return;
      const audio = ensureContext();
      if (!audio) return;
      void audio.resume();
      const now = audio.currentTime;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(72, now);
      oscillator.frequency.exponentialRampToValueAtTime(28, now + 0.22);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.34);
    },
    destroy(){
      stopStormLoop();
      stopRainNoise();
      void context?.close();
      context = null;
    },
  };
}

const randomInRange = (min: number, max: number): number => min + Math.random() * Math.max(0, max - min);

const createEnemyPortals = (): EnemyPortal[] => {
  const portals: EnemyPortal[] = [];
  const createSidePortals = (side: Side, minX: number, maxX: number): void => {
    const count = 1 + Math.floor(Math.random() * 2);
    for (let index = 0; index < count; index += 1){
      portals.push({ id: `${side}-portal-${index + 1}`, side, x: randomInRange(minX, maxX) });
    }
  };
  createSidePortals('left', BUILD_SITE_EDGE_PADDING, CASTLE_OUTER_LEFT - BUILD_SITE_EDGE_PADDING);
  createSidePortals('right', CASTLE_OUTER_RIGHT + BUILD_SITE_EDGE_PADDING, WORLD_WIDTH - BUILD_SITE_EDGE_PADDING);
  return portals;
};

const CSS = /* css */ `
  .app--vinh-da-gameplay{min-height:100dvh;background:#020204;color:#f7f2ff;overflow:hidden;touch-action:none;}
  .vinh-da-game{position:relative;min-height:100dvh;overflow:hidden;background:linear-gradient(#020204 0 58%,#07070b 58% 100%);touch-action:none;user-select:none;}
  .vinh-da-game.is-day{background:linear-gradient(#17294a 0 58%,#0d1118 58% 100%);}
  .vinh-da-game.is-night{background:linear-gradient(#020204 0 58%,#07070b 58% 100%);}
  .vinh-da-game__hud{position:absolute;z-index:5;top:14px;left:14px;right:14px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;pointer-events:none;}
  .vinh-da-game__panel{pointer-events:auto;border:1px solid rgba(210,200,255,.2);border-radius:12px;background:rgba(0,0,0,.5);padding:8px 12px;box-shadow:0 10px 24px rgba(0,0,0,.28);font-size:16px;line-height:1.2;}
  .vinh-da-game__panel--status{max-width:360px;font-size:13px;}
  .vinh-da-game__panel--status div{margin-top:3px;}
  .vinh-da-game__status-warn{color:#ffd166;}
  .vinh-da-game__status-danger{color:#ff7b9c;}
  .vinh-da-game__back{pointer-events:auto;border:0;border-radius:999px;background:#f3edff;color:#111020;width:42px;height:42px;font-size:22px;cursor:pointer;}
  .vinh-da-game__viewport{position:absolute;inset:0;overflow:hidden;cursor:pointer;}
  .vinh-da-game__world{position:absolute;left:0;top:0;width:${WORLD_WIDTH}px;height:100%;transform:translate3d(0,0,0);will-change:transform;background:radial-gradient(circle at 50% 28%,rgba(87,68,168,.34),transparent 18%),repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 220px);}
  .vinh-da-game__celestial{position:absolute;z-index:1;top:9%;left:calc(50% - 42px);width:84px;height:84px;border-radius:999px;pointer-events:none;transition:background .32s ease,box-shadow .32s ease,filter .32s ease;animation:vinh-da-celestial-pulse 2.4s ease-in-out infinite;}
  .vinh-da-game.is-day .vinh-da-game__celestial{background:radial-gradient(circle at 38% 34%,#fff7b5 0 18%,#ffd34d 38%,#f59f1f 68%,rgba(245,159,31,.18) 72%,transparent 100%);box-shadow:0 0 26px rgba(255,211,77,.82),0 0 72px rgba(245,159,31,.38);}
  .vinh-da-game.is-night .vinh-da-game__celestial{background:radial-gradient(circle at 34% 30%,#f7fbff 0 20%,#c9e6ff 42%,#6f8fb7 67%,rgba(111,143,183,.14) 72%,transparent 100%);box-shadow:0 0 18px rgba(201,230,255,.72),0 0 54px rgba(111,143,183,.34);}

  .vinh-da-game__elemental-regions{position:absolute;left:0;right:0;top:0;bottom:0;z-index:1;pointer-events:none;overflow:hidden;}
  .vinh-da-game__element-region{position:absolute;bottom:0;height:${GROUND_PERCENT};overflow:hidden;}
  .vinh-da-game__element-region::before{content:"";position:absolute;inset:0;opacity:.36;}
  .vinh-da-game__element-region--fire::before{background:linear-gradient(180deg,rgba(255,84,71,.02),rgba(255,69,54,.18));}
  .vinh-da-game__element-region--wood::before{background:linear-gradient(180deg,rgba(225,255,235,.035),rgba(96,217,124,.17));}
  .vinh-da-game__element-region--water::before{background:linear-gradient(180deg,rgba(90,197,255,.025),rgba(42,137,213,.16));}
  .vinh-da-game__element-region--earth::before{background:linear-gradient(180deg,rgba(170,123,73,.02),rgba(151,103,57,.17));}
  .vinh-da-game__element-region--metal::before{background:linear-gradient(180deg,rgba(250,253,255,.05),rgba(154,166,184,.24));box-shadow:inset 0 0 22px rgba(255,255,255,.08);}
  .vinh-da-game__element-region--thunder::before{background:linear-gradient(180deg,rgba(235,242,255,.025),rgba(210,220,238,.18));}
  .vinh-da-game__element-region--blood::before{background:linear-gradient(180deg,rgba(92,0,8,.035),rgba(112,7,18,.26) 72%,rgba(0,0,0,.08));}
  .vinh-da-game__element-region--light::before{background:linear-gradient(180deg,rgba(255,245,184,.025),rgba(255,232,128,.16));}
  .vinh-da-game__element-region--wind::before{background:linear-gradient(180deg,rgba(137,223,255,.025),rgba(91,195,238,.17));}
  .vinh-da-game__element-region--dark::before{background:linear-gradient(180deg,rgba(5,5,12,.04),rgba(0,0,0,.24));}
  .vinh-da-game__element-region-particle{position:absolute;bottom:8%;width:5px;height:5px;border-radius:999px;opacity:0;animation:vinh-da-element-particle 3.8s ease-in-out infinite;will-change:transform,opacity;}
  .vinh-da-game__element-region--fire .vinh-da-game__element-region-particle{background:rgba(255,112,82,.7);box-shadow:0 0 10px rgba(255,76,56,.45);}
  .vinh-da-game__element-region--wood .vinh-da-game__element-region-particle{background:rgba(205,255,218,.72);box-shadow:0 0 11px rgba(89,234,123,.5);}
  .vinh-da-game__element-region--water .vinh-da-game__element-region-particle{background:rgba(122,211,255,.72);box-shadow:0 0 10px rgba(65,168,255,.46);}
  .vinh-da-game__element-region--earth .vinh-da-game__element-region-particle{background:rgba(182,133,84,.62);box-shadow:0 0 8px rgba(142,92,51,.38);}
  .vinh-da-game__element-region--metal .vinh-da-game__element-region-particle{background:rgba(244,248,255,.82);box-shadow:0 0 12px rgba(190,200,218,.72),0 0 2px rgba(255,255,255,.95);}
  .vinh-da-game__element-region--thunder .vinh-da-game__element-region-particle{background:rgba(232,238,248,.78);box-shadow:0 0 10px rgba(220,230,255,.58);}
  .vinh-da-game__element-region--blood .vinh-da-game__element-region-particle{width:7px;height:7px;background:rgba(164,10,29,.82);box-shadow:0 0 13px rgba(155,0,26,.72),0 0 22px rgba(38,0,8,.62);}
  .vinh-da-game__element-region--light .vinh-da-game__element-region-particle{background:rgba(255,242,179,.72);box-shadow:0 0 10px rgba(255,226,120,.5);}
  .vinh-da-game__element-region--wind .vinh-da-game__element-region-particle{background:rgba(133,222,255,.74);box-shadow:0 0 11px rgba(78,190,242,.54);}
  .vinh-da-game__element-region--dark .vinh-da-game__element-region-particle{background:rgba(22,20,31,.76);box-shadow:0 0 9px rgba(0,0,0,.58);}
  .vinh-da-game__weather-layer{position:absolute;inset:0;z-index:3;pointer-events:none;background:transparent;}
  .vinh-da-game.is-night .vinh-da-game__weather-layer::before{content:"";position:absolute;inset:0;background:linear-gradient(rgba(1,2,8,.42),rgba(1,2,8,.58));}
  .vinh-da-game__weather-layer::after{content:"";position:absolute;inset:0;opacity:0;transition:opacity .08s linear;background:rgba(232,242,255,.86);}
  .vinh-da-game__weather-layer.is-cloudy{box-shadow:inset 0 0 180px rgba(85,92,115,.22);}
  .vinh-da-game__weather-layer.is-drizzle{background:repeating-linear-gradient(105deg,rgba(196,224,255,.18) 0 1px,transparent 1px 18px);}
  .vinh-da-game__weather-layer.is-rain{background:linear-gradient(rgba(20,28,48,.12),rgba(20,28,48,.18)),repeating-linear-gradient(105deg,rgba(196,224,255,.38) 0 2px,transparent 2px 14px);}
  .vinh-da-game__weather-layer.is-heavy-rain{background:linear-gradient(rgba(4,6,17,.22),rgba(4,6,17,.32)),repeating-linear-gradient(105deg,rgba(215,234,255,.48) 0 2px,transparent 2px 10px);}
  .vinh-da-game__weather-layer.is-storm{background:linear-gradient(rgba(4,6,17,.34),rgba(4,6,17,.52)),repeating-linear-gradient(105deg,rgba(225,240,255,.58) 0 2px,transparent 2px 8px);}
  .vinh-da-game__weather-layer.is-fog{background:linear-gradient(0deg,rgba(220,230,240,.22),rgba(220,230,240,.04) 55%,transparent);backdrop-filter:blur(1px);}
  .vinh-da-game__weather-layer.is-blood-moon{background:radial-gradient(circle at 50% 20%,rgba(170,20,34,.36),transparent 22%),linear-gradient(rgba(50,0,8,.16),rgba(50,0,8,.3));}
  .vinh-da-game__weather-layer.is-lightning::after{opacity:.72;}
  .vinh-da-game__ground{position:absolute;left:0;right:0;bottom:0;height:${GROUND_PERCENT};background:linear-gradient(#121018,#050507);border-top:1px solid rgba(210,200,255,.18);}
  .vinh-da-game__castle{position:absolute;left:${CASTLE_LEFT}px;bottom:${GROUND_PERCENT};width:${CASTLE_WIDTH}px;height:170px;background:linear-gradient(180deg,#202033,#0d0d16);border:2px solid rgba(226,222,255,.2);box-shadow:0 0 44px rgba(83,65,170,.3);}
  .vinh-da-game__castle::before,.vinh-da-game__castle::after{content:"";position:absolute;bottom:0;width:${CASTLE_TOWER_WIDTH}px;height:230px;background:#11111f;border:2px solid rgba(226,222,255,.18)}
  .vinh-da-game__castle::before{left:-${CASTLE_TOWER_OFFSET}px}.vinh-da-game__castle::after{right:-${CASTLE_TOWER_OFFSET}px}
  .vinh-da-game__crystal{position:absolute;left:${CRYSTAL_X}px;bottom:calc(${GROUND_PERCENT} + 34px);width:50px;height:72px;transform:translateX(-50%) rotate(45deg);border-radius:12px;background:linear-gradient(135deg,#eaffff,#a887ff 45%,#4cf6ff);box-shadow:0 0 18px #dff,0 0 42px rgba(121,93,255,.78);animation:vinh-da-crystal-shine 1.8s ease-in-out infinite;}
  .vinh-da-game__crystal::after{content:"";position:absolute;inset:8px 20px;background:rgba(255,255,255,.72);filter:blur(2px);}
  .vinh-da-game__leader{position:absolute;bottom:${GROUND_PERCENT};width:46px;height:82px;border-radius:10px 10px 6px 6px;background:linear-gradient(180deg,#f4d78a,#7447ff);box-shadow:0 0 26px rgba(245,215,138,.55);transform:translate3d(0,0,0);will-change:transform;z-index:2;}
  .vinh-da-game__drop{position:absolute;bottom:calc(${GROUND_PERCENT} + 10px);width:18px;height:18px;margin-left:-9px;border-radius:999px;background:radial-gradient(circle,#f5f7ff,#6dc8ff 48%,#352073);box-shadow:0 0 14px rgba(109,200,255,.75);z-index:2;}
  .vinh-da-game__notice{position:absolute;left:50%;top:82px;transform:translateX(-50%);padding:6px 12px;border-radius:999px;background:rgba(245,247,255,.88);color:#352073;font-size:13px;font-weight:700;box-shadow:0 0 18px rgba(109,200,255,.45);opacity:0;pointer-events:none;transition:opacity .18s ease;z-index:8;}
  .vinh-da-game__notice--visible{opacity:1;}
  .vinh-da-game__portal{position:absolute;bottom:${GROUND_PERCENT};width:54px;height:86px;margin-left:-27px;border-radius:999px 999px 12px 12px;background:radial-gradient(ellipse at 50% 50%,rgba(222,142,255,.92),rgba(92,41,168,.72) 42%,rgba(18,8,34,.9) 68%,transparent 70%);box-shadow:0 0 28px rgba(190,94,255,.72);z-index:1;pointer-events:none;}
  .vinh-da-game__portal::after{content:"";position:absolute;inset:13px 18px;border-radius:999px;background:rgba(8,4,18,.82);box-shadow:inset 0 0 18px rgba(238,211,255,.36);}
  .vinh-da-game__enemy{position:absolute;bottom:${GROUND_PERCENT};width:38px;height:52px;margin-left:-19px;border-radius:18px 18px 8px 8px;background:linear-gradient(180deg,#d14b5f,#381018);box-shadow:0 0 18px rgba(209,75,95,.34);transform:translate3d(0,0,0);will-change:transform;z-index:2;}
  .vinh-da-game__rock{position:absolute;bottom:${GROUND_PERCENT};width:96px;height:58px;margin-left:-48px;border:0;border-radius:46% 54% 38% 42%;background:linear-gradient(150deg,#7e7b8e,#383746 58%,#1f1f2a);box-shadow:inset -12px -10px 18px rgba(0,0,0,.32),0 8px 22px rgba(0,0,0,.35);cursor:pointer;z-index:2;}
  .vinh-da-game__rock::after{content:"";position:absolute;left:18px;top:12px;width:42px;height:10px;border-radius:999px;background:rgba(255,255,255,.18);transform:rotate(-12deg);}
  .vinh-da-game__wall-slot{position:absolute;bottom:${GROUND_PERCENT};width:70px;height:78px;margin-left:-35px;border:1px dashed rgba(210,200,255,.32);border-radius:10px;background:linear-gradient(180deg,rgba(121,93,255,.12),rgba(16,14,26,.28));box-shadow:0 0 18px rgba(121,93,255,.16);cursor:pointer;z-index:2;}
  .vinh-da-game__wall-slot::after{content:"";position:absolute;left:12px;right:12px;bottom:10px;height:8px;border-radius:999px;background:rgba(210,200,255,.18);}
  .vinh-da-game__plot{position:absolute;bottom:${GROUND_PERCENT};width:86px;height:40px;margin-left:-43px;border:1px solid rgba(91,255,178,.58);border-radius:999px;background:rgba(91,255,178,.035);box-shadow:none;cursor:pointer;z-index:1;}
  .vinh-da-game__plot::after{content:"";position:absolute;left:16px;right:16px;top:50%;height:1px;background:rgba(91,255,178,.72);transform:translateY(-50%);}
  .vinh-da-game__rock.has-structure,.vinh-da-game__plot.has-structure{border-radius:10px 10px 4px 4px;border:1px solid rgba(226,222,255,.28);box-shadow:0 0 24px rgba(133,105,255,.45);}
  .vinh-da-game__plot.has-structure{width:96px;height:58px;margin-left:-48px;border-color:rgba(91,255,178,.72);outline:1px solid rgba(91,255,178,.32);background:rgba(8,8,16,.22);box-shadow:none;}
  .vinh-da-game__structure--watchtower{background:linear-gradient(180deg,#3a2b67,#12111f);}
  .vinh-da-game__structure--elementalTower{background:linear-gradient(180deg,#1f5b73,#101621);}
  .vinh-da-game__structure--elementalTower[data-element="Hỏa"]{box-shadow:0 0 24px rgba(255,84,71,.52);}
  .vinh-da-game__structure--elementalTower[data-element="Mộc"]{box-shadow:0 0 24px rgba(96,217,124,.48);}
  .vinh-da-game__structure--elementalTower[data-element="Thủy"]{box-shadow:0 0 24px rgba(42,137,213,.5);}
  .vinh-da-game__structure--elementalTower[data-element="Thổ"]{box-shadow:0 0 24px rgba(151,103,57,.48);}
  .vinh-da-game__structure--elementalTower[data-element="Kim"]{box-shadow:0 0 24px rgba(190,200,218,.54);}
  .vinh-da-game__structure--elementalTower[data-element="Lôi"]{box-shadow:0 0 24px rgba(220,230,255,.54);}
  .vinh-da-game__structure--elementalTower[data-element="Huyết"]{box-shadow:0 0 24px rgba(155,0,26,.54);}
  .vinh-da-game__structure--elementalTower[data-element="Ánh Sáng"]{box-shadow:0 0 24px rgba(255,226,120,.54);}
  .vinh-da-game__structure--elementalTower[data-element="Phong"]{box-shadow:0 0 24px rgba(78,190,242,.54);}
  .vinh-da-game__structure--barracks{background:linear-gradient(180deg,#463624,#14100d);}
  .vinh-da-game__structure--church{background:linear-gradient(180deg,#efe5ff,#44305f);}
  .vinh-da-game__structure--crystalSeal{background:linear-gradient(135deg,#eaffff,#7b5cff 48%,#39e8ff);}
  .vinh-da-game__structure--landmine{background:radial-gradient(circle at 50% 50%,#ff544d 0 18%,#2a1412 19% 54%,#100807 55% 100%);}
  .vinh-da-game__structure--spikeTrap{background:repeating-linear-gradient(120deg,#1a1518 0 11px,#6f7183 11px 14px,#1a1518 14px 24px);}
  .vinh-da-game__structure--antiAirCannon{background:linear-gradient(180deg,#2f394b,#121821 46%,#0b0d11);}
  .vinh-da-game__structure--gravityCannon{background:radial-gradient(circle at 50% 38%,#b78cff,#37246f 42%,#0d0b16 72%);}
  .vinh-da-game__structure--swamp{background:radial-gradient(ellipse at 50% 62%,rgba(88,151,97,.85),rgba(28,57,48,.92) 58%,rgba(9,19,18,.96));}
  .vinh-da-game__rock.has-structure::before,.vinh-da-game__plot.has-structure::before,.vinh-da-game__wall-slot.has-structure::before{content:attr(data-structure-label);position:absolute;left:50%;bottom:64px;transform:translateX(-50%);font-size:11px;color:#eee6ff;text-shadow:0 1px 5px #000;white-space:nowrap;}
  .vinh-da-game__structure--wall{border-style:solid;border-color:rgba(226,222,255,.34);background:repeating-linear-gradient(90deg,#2e2944 0 18px,#181625 18px 36px);box-shadow:0 0 22px rgba(133,105,255,.38);}
  .vinh-da-game__structure--wall::before{bottom:84px;}
  .vinh-da-game__build-menu{position:absolute;bottom:calc(${GROUND_PERCENT} + 36px);width:170px;height:170px;margin-left:-85px;pointer-events:none;opacity:0;transform:scale(.88);transition:opacity .16s ease,transform .16s ease;z-index:4;}
  .vinh-da-game__build-menu.is-open{opacity:1;transform:scale(1);pointer-events:auto;}
  .vinh-da-game__build-node{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px;border-radius:999px;border:1px solid rgba(230,220,255,.42);background:rgba(8,8,16,.22);backdrop-filter:blur(2px);color:#f5f0ff;display:grid;place-items:center;font-size:24px;box-shadow:0 0 20px rgba(170,140,255,.2);}
  .vinh-da-game__build-node small{position:absolute;top:48px;font-size:9px;color:#d6ccff;text-shadow:0 1px 4px #000;white-space:nowrap;}
  .vinh-da-game__build-node em{position:absolute;top:61px;font-style:normal;font-size:8px;color:#f6d68a;text-shadow:0 1px 4px #000;white-space:nowrap;}
  .vinh-da-game__build-node:nth-child(1){transform:translate(0,-58px);}
  .vinh-da-game__build-node:nth-child(2){transform:translate(50px,-29px);}
  .vinh-da-game__build-node:nth-child(3){transform:translate(50px,29px);}
  .vinh-da-game__build-node:nth-child(4){transform:translate(0,58px);}
  .vinh-da-game__build-node:nth-child(5){transform:translate(-50px,29px);}
  .vinh-da-game__build-node:nth-child(6){transform:translate(-50px,-29px);}
  .vinh-da-game__build-menu.is-upgrade-menu{width:96px;height:96px;margin-left:-48px;}
  .vinh-da-game__build-menu.is-upgrade-menu .vinh-da-game__build-node{transform:translate(0,0);}
  .vinh-da-game__build-node[hidden]{display:none;}
  @keyframes vinh-da-crystal-shine{0%,100%{filter:brightness(1);transform:translateX(-50%) rotate(45deg) scale(1)}50%{filter:brightness(1.45);transform:translateX(-50%) rotate(45deg) scale(1.06)}}
  @keyframes vinh-da-celestial-pulse{0%,100%{filter:brightness(1);transform:scale(1)}50%{filter:brightness(1.28);transform:scale(1.08)}}
  @keyframes vinh-da-element-particle{0%{opacity:0;transform:translate3d(0,8px,0) scale(.65)}28%{opacity:.5}70%{opacity:.22}100%{opacity:0;transform:translate3d(0,-42px,0) scale(1.28)}}
`;

export function renderScreen(context: RenderContext): { destroy: () => void }{
  const { root, shell = null, params = null } = context;
  ensureStyleTag(STYLE_ID, { css: CSS });

  const leaderId = typeof params?.leaderId === 'string' ? params.leaderId : ROSTER[0]?.id;
  const leader = leaderId ? getMetaById(leaderId) : null;
  const frameCap = getFrameRateCap();
  const minFrameMs = 1000 / frameCap;
  let leaderX = LEADER_START_X;
  let targetX = leaderX;
  let cameraX = 0;
  let lastTime = performance.now();
  let lastFrameTime = performance.now();
  let rafId = 0;
  let openSiteId: string | null = null;
  let groundPlotsVisible = false;
  let selectedGroundPlotId: string | null = null;
  let bloodSealStone = 0;
  let carriedDaThach = 0;
  const carriedResources: TieredAmount[] = [];
  const baseStoredResources: TieredAmount[] = [];
  let baseLiquidHnt = 0;
  let condensedHnt = 0;
  let baseEnergyShortage = false;
  let baseHp = 20;
  let baseLevel = 0;
  let baseBranchLv3: BaseBranchLv3 | undefined;
  let baseX = CRYSTAL_X;
  const baseStatuses: VinhDaStatusCollection = {};
  let leaderHp = 20;
  let leaderMaxHp = 20;
  let leaderShield = 0;
  let leaderShieldNightIndex: number | undefined;
  let leaderEmergencyCooldownUntilNight = 0;
  const keys = new Set<string>();
  const structures = new Map<string, PlacedStructure>();
  const structureRuntimes = new Map<string, StructureRuntime>();
  const structureSitesByType = new Map<StructureType, Set<string>>();
  const enemies: Enemy[] = [];
  const enemyPortals = createEnemyPortals();
  const droppedResources: DroppedResource[] = [];
  const lootRng = createRngState(Date.now());
  const enemyElements = new Map<number, HTMLElement>();
  const droppedResourceElements = new Map<number, HTMLElement>();
  let nextEnemyId = 1;
  let nextDroppedResourceId = 1;
  let enemySpawnTimer = 0;
  let dayNightPhase: DayNightPhase = 'night';
  let phaseRemainingSeconds = DAY_DURATION_SECONDS;
  let weather: WeatherType = 'clear';
  let lightningFlashTimer = 0;
  let weatherPhase: DayNightPhase = dayNightPhase;
  let leaderAttackCooldown = 0;
  let nightIndex = 1;
  let waveThreatBudgetRemaining = getScaledThreatBudget(getVinhDaWaveConfig(nightIndex).threatBudget, nightIndex);
  const audio = createVinhDaAudioController();

  const section = document.createElement('section');
  section.className = 'vinh-da-game';
  const mount = mountSection({ root, section, rootClasses: 'app--vinh-da-gameplay' });
  section.innerHTML = `
    <div class="vinh-da-game__hud">
      <div class="vinh-da-game__panel">
        <strong>Vĩnh Dạ · ${leader?.name ?? leaderId ?? 'Leader'}</strong>
        <div>Nguyên Tinh cứng: <span data-role="blood-seal-stone">${bloodSealStone}</span> HNT · Đang chở: <span data-role="carried-resource">${carriedDaThach}</span> Dạ Thạch</div>
        <div>Năng lượng lỏng base: <span data-role="base-liquid-hnt">0</span> HNT · <span data-role="base-energy-status">Đủ Năng Lượng</span></div>
        <div data-role="resource-inventory"></div>
        <div>Phase: <span data-role="day-night-phase"></span></div>
        <div>Đêm: <span data-role="night-index"></span> · Budget: <span data-role="wave-threat-budget"></span></div>
        <div>Còn lại: <span data-role="phase-time-remaining"></span></div>
      </div>
      <div class="vinh-da-game__panel vinh-da-game__panel--status" data-role="status-panel"></div>
      <button class="vinh-da-game__build-node" data-role="escort-start" type="button" title="Mở đường hộ tống">⇢<small>Hộ tống</small></button>
      <button class="vinh-da-game__back" type="button" aria-label="Về World Map">↩</button>
    </div>
    <div class="vinh-da-game__notice" data-role="notice" aria-live="polite"></div>
    <div class="vinh-da-game__viewport" data-role="viewport">
      <div class="vinh-da-game__world" data-role="world">
      <div class="vinh-da-game__celestial" aria-hidden="true"></div>
        <div class="vinh-da-game__weather-layer" data-role="weather-layer" aria-hidden="true"></div>
        <div class="vinh-da-game__castle" data-role="castle" aria-hidden="true"></div>
        <div class="vinh-da-game__crystal" data-role="crystal" aria-label="Pha lê thành trì"></div>
        <div class="vinh-da-game__ground" aria-hidden="true"></div>
        <div class="vinh-da-game__elemental-regions" data-role="elemental-regions" aria-hidden="true"></div>
        <div data-role="build-sites"></div>
        <div data-role="enemy-portals"></div>
        <div data-role="dropped-resources"></div>
        <div data-role="enemies"></div>
        <div class="vinh-da-game__leader" data-role="leader" title="${leader?.name ?? leaderId ?? 'Leader'}"></div>
      </div>
    </div>`;

  const world = section.querySelector<HTMLElement>('[data-role="world"]');
  const castleElement = section.querySelector<HTMLElement>('[data-role="castle"]');
  const crystalElement = section.querySelector<HTMLElement>('[data-role="crystal"]');
  const escortStartButton = section.querySelector<HTMLButtonElement>('[data-role="escort-start"]');
  const sprite = section.querySelector<HTMLElement>('[data-role="leader"]');
  const viewport = section.querySelector<HTMLElement>('[data-role="viewport"]');
  const weatherLayer = section.querySelector<HTMLElement>('[data-role="weather-layer"]');
  const buildSitesContainer = section.querySelector<HTMLElement>('[data-role="build-sites"]');
  const elementalRegionsContainer = section.querySelector<HTMLElement>('[data-role="elemental-regions"]');
  const enemiesContainer = section.querySelector<HTMLElement>('[data-role="enemies"]');
  const enemyPortalsContainer = section.querySelector<HTMLElement>('[data-role="enemy-portals"]');
  const droppedResourcesContainer = section.querySelector<HTMLElement>('[data-role="dropped-resources"]');
  const noticeElement = section.querySelector<HTMLElement>('[data-role="notice"]');
  const bloodSealStoneText = section.querySelector<HTMLElement>('[data-role="blood-seal-stone"]');
  const carriedResourceText = section.querySelector<HTMLElement>('[data-role="carried-resource"]');
  const baseLiquidHntText = section.querySelector<HTMLElement>('[data-role="base-liquid-hnt"]');
  const baseEnergyStatusText = section.querySelector<HTMLElement>('[data-role="base-energy-status"]');
  const resourceInventoryText = section.querySelector<HTMLElement>('[data-role="resource-inventory"]');
  const dayNightPhaseText = section.querySelector<HTMLElement>('[data-role="day-night-phase"]');
  const phaseTimeRemainingText = section.querySelector<HTMLElement>('[data-role="phase-time-remaining"]');
  const nightIndexText = section.querySelector<HTMLElement>('[data-role="night-index"]');
  const waveThreatBudgetText = section.querySelector<HTMLElement>('[data-role="wave-threat-budget"]');
  const statusPanel = section.querySelector<HTMLElement>('[data-role="status-panel"]');
  const mapTier = getVinhDaMapTier(params);
  const elementalRegions = createElementalRegions(mapTier, createElementalRegionRandom());
  const elementalRegionsById = new Map(elementalRegions.map(region => [region.id, region]));
  const elementalRegionElements = new Map<string, HTMLElement>();
  const siteElements = new Map<string, HTMLElement>();
  const buildMenuElements = new Map<string, HTMLDivElement>();
  const buildNodeOptions = [...BUILD_NODE_OPTIONS, ...GROUND_BUILD_NODE_OPTIONS] as const;
  const structureClassNames = buildNodeOptions.map(option => `vinh-da-game__structure--${option.type}`);
  const buildSitesByX = [...BUILD_SITES].sort((a, b) => a.x - b.x);
  const buildSitesById = new Map(buildSitesByX.map(site => [site.id, site]));
  let lastRenderedCameraX = Number.POSITIVE_INFINITY;
  let noticeTimeout: ReturnType<typeof setTimeout> | undefined;

  const showNotice = (message: string): void => {
    if (!noticeElement) return;
    noticeElement.textContent = message;
    noticeElement.classList.add('vinh-da-game__notice--visible');
    if (noticeTimeout) clearTimeout(noticeTimeout);
    noticeTimeout = setTimeout(() => noticeElement.classList.remove('vinh-da-game__notice--visible'), 1600);
  };

  const getStructureMaxHp = (structure: PlacedStructure): number => (
    getStructureLevelStat(structure.type, structure.level, structure.type === 'crystalSeal' ? structure.baseBranchLv3 : structure.branchLv3, structure.branchLv5, structure.element).hp
    + (structureRuntimes.get(structure.siteId)?.linkedMaxHpBonus ?? 0)
  );
  const ensureStructureRuntime = (structure: PlacedStructure): StructureRuntime => {
    const existing = structureRuntimes.get(structure.siteId);
    if (existing) return existing;
    const runtime = { cooldown: structure.type === 'teleport' ? 0 : DEFAULT_STRUCTURE_COOLDOWN, hp: getStructureMaxHp(structure) };
    structureRuntimes.set(structure.siteId, runtime);
    return runtime;
  };
  const trackStructureType = (structure: PlacedStructure): void => {
    let siteIds = structureSitesByType.get(structure.type);
    if (!siteIds){
      siteIds = new Set<string>();
      structureSitesByType.set(structure.type, siteIds);
    }
    siteIds.add(structure.siteId);
    if (structure.mountedStructure){
      let mountedSiteIds = structureSitesByType.get(structure.mountedStructure);
      if (!mountedSiteIds){
        mountedSiteIds = new Set<string>();
        structureSitesByType.set(structure.mountedStructure, mountedSiteIds);
      }
      mountedSiteIds.add(structure.siteId);
    }
  };
  const untrackStructureType = (structure: PlacedStructure): void => {
    const siteIds = structureSitesByType.get(structure.type);
    siteIds?.delete(structure.siteId);
    if (siteIds?.size === 0) structureSitesByType.delete(structure.type);
    if (structure.mountedStructure){
      const mountedSiteIds = structureSitesByType.get(structure.mountedStructure);
      mountedSiteIds?.delete(structure.siteId);
      if (mountedSiteIds?.size === 0) structureSitesByType.delete(structure.mountedStructure);
    }
  };
  const setStructure = (structure: PlacedStructure): void => {
    const previous = structures.get(structure.siteId);
    if (previous) untrackStructureType(previous);
    structures.set(structure.siteId, structure);
    trackStructureType(structure);
  };
  const deleteStructure = (siteId: string): boolean => {
    const structure = structures.get(siteId);
    if (!structure) return false;
    untrackStructureType(structure);
    structures.delete(siteId);
    structureRuntimes.delete(siteId);
    return true;
  };
  const structureSiteIdsOfType = (type: StructureType): Iterable<string> => structureSitesByType.get(type) ?? [];

  const tierValue = (tier: TieredAmount['tier']): number => typeof tier === 'number' ? tier : Number.NEGATIVE_INFINITY;
  const formatResourceAmount = (resource: TieredAmount): string => `${getResourceLabel(resource.resourceId)}${isTieredVinhDaResource(resource.resourceId) ? ` ${resource.tier ?? '?.?'}` : ''} ×${resource.amount}`;
  const getStoredAmount = (resourceId: VinhDaResourceId, requiredTier?: TieredAmount['tier']): number => baseStoredResources.reduce((total, resource) => {
    if (resource.resourceId !== resourceId) return total;
    if (isTieredVinhDaResource(resourceId) && tierValue(resource.tier) < tierValue(requiredTier)) return total;
    return total + resource.amount;
  }, 0);
  const canAfford = (cost: readonly TieredAmount[] | number): boolean => typeof cost === 'number'
    ? bloodSealStone >= cost
    : cost.every(resource => getStoredAmount(resource.resourceId, resource.tier) >= resource.amount);
  const getMissingCost = (cost: readonly TieredAmount[]): TieredAmount[] => cost
    .map(resource => ({ ...resource, amount: Math.max(0, resource.amount - getStoredAmount(resource.resourceId, resource.tier)) }))
    .filter(resource => resource.amount > 0);
  const formatResources = (resources: readonly TieredAmount[]): string => resources.length <= 0
    ? 'trống'
    : resources.map(formatResourceAmount).join(' · ');
  const formatCost = (cost: readonly TieredAmount[]): string => cost.length <= 0 ? 'Miễn phí' : cost.map(formatResourceAmount).join(' · ');
  const getCostFor = (type: StructureType, level: number, branch?: Parameters<typeof getStructureUpgradeCost>[2]): TieredAmount[] => getStructureUpgradeCost(type, level, branch, mapTier);
  const renderEconomy = (): void => {
    if (bloodSealStoneText) bloodSealStoneText.textContent = String(Math.floor(condensedHnt || bloodSealStone));
    if (carriedResourceText) carriedResourceText.textContent = String(carriedDaThach);
    if (baseLiquidHntText) baseLiquidHntText.textContent = baseLiquidHnt.toFixed(1);
    if (baseEnergyStatusText){
      baseEnergyStatusText.textContent = baseEnergyShortage ? 'Thiếu Năng Lượng' : 'Đủ Năng Lượng';
      baseEnergyStatusText.classList.toggle('vinh-da-game__status-danger', baseEnergyShortage);
    }
    if (resourceInventoryText) resourceInventoryText.textContent = `Kho base: ${formatResources(baseStoredResources)} | Đang nhặt: ${formatResources(carriedResources)}`;
  };
  const chooseWeather = (): WeatherType => {
    const roll = Math.random();
    if (dayNightPhase === 'night' && roll < 0.08) return 'bloodMoon';
    if (roll < 0.12) return 'fog';
    if (roll < 0.24) return 'storm';
    if (roll < 0.42) return 'heavyRain';
    if (roll < 0.62) return 'rain';
    if (roll < 0.74) return 'drizzle';
    return 'clear';
  };
  const renderWeather = (): void => {
    section.classList.toggle('is-day', dayNightPhase === 'day' || dayNightPhase === 'escort');
    section.classList.toggle('is-night', dayNightPhase === 'night');
    if (!weatherLayer) return;
    weatherLayer.classList.toggle('is-cloudy', weather !== 'clear');
    weatherLayer.classList.toggle('is-drizzle', weather === 'drizzle');
    weatherLayer.classList.toggle('is-rain', weather === 'rain');
    weatherLayer.classList.toggle('is-heavy-rain', weather === 'heavyRain');
    weatherLayer.classList.toggle('is-storm', weather === 'storm');
    weatherLayer.classList.toggle('is-fog', weather === 'fog');
    weatherLayer.classList.toggle('is-blood-moon', weather === 'bloodMoon');
    weatherLayer.classList.toggle('is-lightning', lightningFlashTimer > 0);
  };
  const triggerLightningFlash = (duration: number): void => {
    lightningFlashTimer = duration;
    if (weather === 'storm') audio.playThunder();
  };
  const updateWeatherScheduler = (dt: number): void => {
    if (weatherPhase !== dayNightPhase){
      weatherPhase = dayNightPhase;
      weather = chooseWeather();
      if (weather === 'storm') triggerLightningFlash(0.12);
    } else if (weather === 'storm' && lightningFlashTimer <= 0 && Math.random() < dt * 0.18){
      triggerLightningFlash(0.08);
    }
    if (lightningFlashTimer > 0) lightningFlashTimer = Math.max(0, lightningFlashTimer - dt);
    audio.syncWeather(weather);
  };
  const formatPercent = (value: number | undefined): string => `${Math.round((value ?? 0) * 100)}%`;
  const formatSeconds = (value: number | undefined): string => `${Math.ceil(Math.max(0, value ?? 0))}s`;
  const describeElementEffect = (element: ElementalTowerElement | undefined): string => {
    switch (element){
      case 'Hỏa': return 'đốt';
      case 'Mộc': return 'hồi/bonus heal';
      case 'Thủy': return 'làm chậm';
      case 'Thổ': return 'tăng ARM/RES';
      case 'Kim': return 'tăng ATK/WIL';
      case 'Lôi': return 'tê liệt';
      case 'Huyết': return 'tăng max HP';
      case 'Ánh Sáng': return 'dễ tổn thương';
      case 'Phong': return 'slow/đẩy lùi';
      default: return 'hiệu ứng hệ';
    }
  };
  const renderStatusPanel = (): void => {
    if (!statusPanel) return;
    const baseStat = getBaseLevelStat(baseLevel, baseBranchLv3);
    const territoryBounds = getLivingTerritoryWallBounds(simulationContext);
    const baseInTerritory = isXInLivingTerritory(simulationContext, getBaseX(simulationState), territoryBounds);
    const contaminationStacks = simulationState.baseStatuses?.contaminationStacks ?? simulationState.contamination ?? 0;
    const church = [...structures.values()].find(structure => structure.type === 'church');
    const churchRuntime = church ? ensureStructureRuntime(church) : null;
    const barracks = [...structures.values()].find(structure => structure.type === 'barracks');
    const barracksRuntime = barracks ? ensureStructureRuntime(barracks) : null;
    const barracksStat = barracks ? getStructureLevelStat('barracks', barracks.level) : null;
    const elemental = [...structures.values()].find(structure => structure.type === 'elementalTower');
    const teleport = [...structures.values()].find(structure => structure.type === 'teleport');
    const teleportCheck = teleport ? canActivateTeleportRetreat(simulationContext) : null;
    const elementalStat = elemental ? getStructureLevelStat('elementalTower', elemental.level, undefined, undefined, elemental.element) : null;
    const lines = [
      `<strong>Pha lê Lv${baseLevel}${baseBranchLv3 ? ` ${baseBranchLv3}` : ''}</strong> HP ${Math.ceil(baseHp)}/${baseStat.hp} · Khiên leader ${Math.ceil(leaderShield)}/${Math.ceil(leaderMaxHp * (baseStat.leaderShieldPercent ?? 0))}`,
      `<div class="${baseInTerritory ? '' : 'vinh-da-game__status-danger'}">Lãnh địa: ${baseInTerritory ? 'đang bảo hộ' : 'ngoài lãnh địa / buff khóa'} · Emergency CD: ${Math.max(0, leaderEmergencyCooldownUntilNight - nightIndex)} đêm</div>`,
      `<div class="${contaminationStacks >= 5 ? 'vinh-da-game__status-danger' : contaminationStacks > 0 ? 'vinh-da-game__status-warn' : ''}">Ô nhiễm: ${contaminationStacks}/5 stack${contaminationStacks >= 5 ? ' · sẽ hóa Sứ Đồ' : ''}</div>`,
    ];
    if (elemental && elementalStat) lines.push(`<div>Tháp NT: ${elemental.element ?? 'Hỏa'} Lv${elemental.level} · cost ${formatCost(getCostFor('elementalTower', elemental.level))} · range ${elementalStat.range ?? 0} · ${describeElementEffect(elemental.element ?? 'Hỏa')}</div>`);
    if (barracks && barracksStat) lines.push(`<div>Trại: ${barracksRuntime?.soldiers?.length ?? 0}/${barracksStat.soldierCap ?? 0} lính · rank ${barracksStat.soldierRank ?? 1} · ulti ${barracksStat.ultimatePermission ? 'ready' : 'khóa'}</div>`);
    if (church) lines.push(`<div>Ấn: prayer ${formatSeconds(churchRuntime?.prayerTimer)} · cleanse ${formatSeconds(churchRuntime?.contaminationCleanseTimer)}</div>`);
    lines.push(`<div class="${canStartEscort(simulationContext) ? 'vinh-da-game__status-warn' : ''}">Hộ tống: ${simulationState.dayNightPhase === 'escort' ? `đang mở đường tới ${Math.round(getBaseX(simulationState))}` : canStartEscort(simulationContext) ? 'sẵn sàng mở đường' : 'cần Dạ Thạch/đêm/tàn khu'}</div>`);
    if (teleport) lines.push(`<div class="${teleportCheck?.ok ? '' : 'vinh-da-game__status-warn'}">Truyền Tống: phí ${TELEPORT_RETREAT_COST} · giữ ${Math.round(TELEPORT_BANKED_RESOURCE_KEEP_RATIO * 100)}% kho · ${teleportCheck?.ok ? 'sẵn sàng rút lui' : teleportCheck?.reason === 'cooldown' ? `CD ${formatSeconds(teleportCheck.cooldownSeconds)}` : teleportCheck?.reason === 'insufficient-resource' ? 'thiếu Dạ Thạch' : 'chưa sẵn sàng'}</div>`);
    statusPanel.innerHTML = lines.join('');
  };
  const renderDayNightTimer = (): void => {
    if (dayNightPhaseText) dayNightPhaseText.textContent = simulationState.dayNightPhase === 'night' ? 'Đêm / combat' : simulationState.dayNightPhase === 'escort' ? 'Hộ tống' : 'Ngày';
    if (nightIndexText) nightIndexText.textContent = String(simulationState.nightIndex);
    if (waveThreatBudgetText) waveThreatBudgetText.textContent = simulationState.dayNightPhase === 'night' ? simulationState.waveThreatBudgetRemaining.toFixed(1) : 'clear';
    if (phaseTimeRemainingText){
      const totalSeconds = Math.max(0, Math.ceil(simulationState.phaseRemainingSeconds));
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      phaseTimeRemainingText.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
    }
  };
  const spend = (cost: readonly TieredAmount[] | number): boolean => {
    if (typeof cost === 'number'){
      if (!canAfford(cost)) return false;
      bloodSealStone -= cost;
      renderEconomy();
      return true;
    }
    if (!canAfford(cost)) return false;
    for (const required of cost){
      let remaining = required.amount;
      const matching = baseStoredResources
        .filter(resource => resource.resourceId === required.resourceId && (!isTieredVinhDaResource(required.resourceId) || tierValue(resource.tier) >= tierValue(required.tier)))
        .sort((a, b) => tierValue(a.tier) - tierValue(b.tier));
      for (const resource of matching){
        if (remaining <= 0) break;
        const used = Math.min(resource.amount, remaining);
        resource.amount -= used;
        remaining -= used;
      }
    }
    for (let index = baseStoredResources.length - 1; index >= 0; index -= 1){
      const stored = baseStoredResources[index];
      if (stored && stored.amount <= 0) baseStoredResources.splice(index, 1);
    }
    renderEconomy();
    return true;
  };
  const clampLeaderX = (x: number): number => Math.max(LEADER_EDGE_PADDING_LEFT, Math.min(WORLD_WIDTH - LEADER_EDGE_PADDING_RIGHT, x));
  const getBuildSite = (siteId: string | null | undefined): BuildSite | null => siteId ? buildSitesById.get(siteId) ?? null : null;
  const nearestBuildSite = (): BuildSite | null => BUILD_SITES.find(site => Math.abs(leaderX - site.x) <= BUILD_RANGE) ?? null;
  const isGroundClick = (event: PointerEvent): boolean => {
    const bounds = viewport?.getBoundingClientRect();
    const viewportTop = bounds?.top ?? 0;
    const viewportHeight = bounds?.height || window.innerHeight || 1;
    return event.clientY >= viewportTop + viewportHeight * 0.58;
  };
  const getBuildSiteClassName = (site: BuildSite): string => {
    if (site.kind === 'wall-slot') return 'vinh-da-game__wall-slot';
    if (site.kind === 'ground') return 'vinh-da-game__plot';
    return 'vinh-da-game__rock';
  };
  const createBuildSiteElement = (site: BuildSite): void => {
    if (!buildSitesContainer || siteElements.has(site.id)) return;
    const button = document.createElement('button');
    button.className = getBuildSiteClassName(site);
    button.dataset.buildSiteId = site.id;
    button.style.left = `${site.x}px`;
    button.type = 'button';

    const menu = document.createElement('div');
    menu.className = 'vinh-da-game__build-menu';
    menu.dataset.buildMenu = site.id;
    menu.style.left = `${site.x}px`;
    const nodeOptions = buildNodeOptions.filter(option => isStructureAllowedOnBuildSite(option.type, site) || (site.kind === 'wall-slot' && isStructureAllowedOnBuildSite(option.type, { kind: 'rock' })));
    nodeOptions.forEach((option) => {
      const node = document.createElement('button');
      node.className = 'vinh-da-game__build-node';
      node.dataset.structureType = option.type;
      node.type = 'button';
      node.setAttribute('aria-label', option.label);
      node.innerHTML = `+<small>${option.label}</small>`;
      menu.append(node);
    });
    const upgradeNode = document.createElement('button');
    upgradeNode.className = 'vinh-da-game__build-node';
    upgradeNode.dataset.action = 'upgrade';
    upgradeNode.type = 'button';
    upgradeNode.setAttribute('aria-label', UPGRADE_NODE_LABEL);
    upgradeNode.hidden = true;
    upgradeNode.innerHTML = `↑<small>${UPGRADE_NODE_LABEL}</small>`;
    menu.append(upgradeNode);

    const addActionNode = (action: string, label: string): void => {
      const node = document.createElement('button');
      node.className = 'vinh-da-game__build-node';
      node.dataset.action = action;
      node.type = 'button';
      node.setAttribute('aria-label', label);
      node.hidden = true;
      node.innerHTML = `◆<small>${label}</small>`;
      menu.append(node);
    };
    addActionNode('branch-lv3-spike', 'Gai nhọn');
    addActionNode('branch-lv3-slippery', 'Trơn tuột');
    addActionNode('branch-lv3-shock', 'Phản chấn');
    addActionNode('base-branch-lv3-defense', 'Base phòng thủ');
    addActionNode('base-branch-lv3-attack', 'Base tấn công');
    addActionNode('branch-lv5-biochemical', 'Sinh hoá');
    addActionNode('branch-lv5-curse', 'Nguyền rủa');
    addActionNode('branch-lv5-link', 'Liên kết');
    addActionNode('toggle-gravity', 'Bật/tắt hút');
    for (const element of ELEMENTAL_TOWER_ELEMENTS) addActionNode(`build-element-${element}`, element);
    addActionNode('cycle-element', 'Đổi hệ');
    addActionNode('activate-teleport', 'Rút lui');

    buildSitesContainer.append(button, menu);
    siteElements.set(site.id, button);
    buildMenuElements.set(site.id, menu);
    renderBuildSite(site.id);
  };
  const renderBuildMenu = (siteId: string): void => {
    const menu = buildMenuElements.get(siteId);
    const site = getBuildSite(siteId);
    if (!menu || !site) return;
    const structure = structures.get(siteId);
    menu.classList.toggle('is-upgrade-menu', Boolean(structure));
    for (const node of menu.querySelectorAll<HTMLElement>('.vinh-da-game__build-node')){
      const type = node.dataset.structureType as StructureType | undefined;
      const action = node.dataset.action;
      const isUpgradeNode = action === 'upgrade';
      const nextLevel = structure ? Math.min(structure.level + 1, 6) : 1;
      const branch = action?.startsWith('branch-lv3-') ? action.slice('branch-lv3-'.length) as Parameters<typeof getStructureUpgradeCost>[2] : action?.startsWith('base-branch-lv3-') ? action.slice('base-branch-lv3-'.length) as Parameters<typeof getStructureUpgradeCost>[2] : action?.startsWith('branch-lv5-') ? action.slice('branch-lv5-'.length) as Parameters<typeof getStructureUpgradeCost>[2] : undefined;
      const cost = structure ? getCostFor(structure.type, nextLevel, branch) : type ? getCostFor(type, 1) : [];
      const isLv3Branch = structure?.type === 'wall' && structure.level === 2 && action?.startsWith('branch-lv3-');
      const isBaseLv3Branch = structure?.type === 'crystalSeal' && structure.level === 2 && action?.startsWith('base-branch-lv3-');
      const isLv5Branch = structure?.type === 'wall' && structure.level === 4 && action?.startsWith('branch-lv5-');
      const canMount = structure?.type === 'wall' && structure.level >= 6 && !structure.mountedStructure && type !== undefined && type !== 'wall' && isStructureAllowedOnBuildSite(type, { kind: 'rock' });
      const canToggleGravity = structure?.type === 'gravityCannon' && structure.level >= 6 && action === 'toggle-gravity';
      const canBuildElement = !structure && action?.startsWith('build-element-') && isStructureAllowedOnBuildSite('elementalTower', site);
      const canMountElement = structure?.type === 'wall' && structure.level >= 6 && !structure.mountedStructure && action?.startsWith('build-element-') && isStructureAllowedOnBuildSite('elementalTower', { kind: 'rock' });
      const canCycleElement = (structure?.type === 'elementalTower' || structure?.mountedStructure === 'elementalTower') && action === 'cycle-element';
      const teleportCheck = structure?.type === 'teleport' && action === 'activate-teleport' ? canActivateTeleportRetreat(simulationContext) : null;
      const canShowTeleport = structure?.type === 'teleport' && action === 'activate-teleport';
      node.hidden = structure
        ? (
            isUpgradeNode
              ? structure.level >= 6 || (structure.level === 2 && (structure.type === 'wall' || structure.type === 'crystalSeal')) || (structure.level === 4 && structure.type === 'wall')
              : action
                ? !(isLv3Branch || isBaseLv3Branch || isLv5Branch || canToggleGravity || canBuildElement || canMountElement || canCycleElement || canShowTeleport)
                : !canMount
          )
        : isUpgradeNode || (Boolean(action) && !canBuildElement) || (!action && (!type || type === 'elementalTower' || !isStructureAllowedOnBuildSite(type, site)));
      const buildElement = action?.startsWith('build-element-') ? action.slice('build-element-'.length) as ElementalTowerElement : undefined;
      const effectiveCost = buildElement ? getCostFor('elementalTower', 1) : cost;
      const missingCost = getMissingCost(effectiveCost);
      const titleParts = [`Cost ${formatCost(effectiveCost)}`, missingCost.length > 0 ? `Thiếu ${formatCost(missingCost)}` : 'Đủ vật liệu'];
      if (type){
        const stat = getStructureLevelStat(type, structure?.mountedStructure === type ? structure.mountedLevel ?? 1 : nextLevel);
        if (stat.range) titleParts.push(`Range ${stat.range}`);
        if (type === 'watchtower') titleParts.push('rock-site tower');
        if (type === 'elementalTower') titleParts.push('Chọn hệ bằng node hệ riêng');
        if (type === 'teleport') titleParts.push(`Rút lui về map cũ đã phong ấn · phí ${TELEPORT_RETREAT_COST} · giữ ${Math.round(TELEPORT_BANKED_RESOURCE_KEEP_RATIO * 100)}% Dạ Thạch trong kho`);
      }
      if (buildElement) titleParts.push(`Xây Tháp Nguyên Tố hệ ${buildElement} · ${describeElementEffect(buildElement)}`);
      if (teleportCheck && !teleportCheck.ok) titleParts.push(teleportCheck.reason === 'cooldown' ? `Cooldown ${formatSeconds(teleportCheck.cooldownSeconds)}` : teleportCheck.reason === 'insufficient-resource' ? `Thiếu phí ${TELEPORT_RETREAT_COST}` : 'Không thể kích hoạt');
      if (structure?.type === 'wall') titleParts.push(`Tường lãnh địa · lv3 ${structure.branchLv3 ?? 'chưa chọn'} · lv5 ${structure.branchLv5 ?? 'chưa chọn'}`);
      node.title = titleParts.join(' · ');
      let detail = node.querySelector('em');
      if (!detail){
        detail = document.createElement('em');
        node.append(detail);
      }
      const detailStat = buildElement ? getStructureLevelStat('elementalTower', 1, undefined, undefined, buildElement) : type ? getStructureLevelStat(type, nextLevel) : null;
      detail.textContent = detailStat ? `${missingCost.length > 0 ? 'Thiếu' : 'Đủ'}${detailStat.range ? ` R${detailStat.range}` : ''}` : (missingCost.length > 0 ? 'Thiếu' : 'Đủ');
      if (node instanceof HTMLButtonElement) node.disabled = !node.hidden && (teleportCheck ? !teleportCheck.ok : !canAfford(effectiveCost));
    }
  };
  const renderBuildSite = (siteId: string): void => {
    const siteButton = siteElements.get(siteId);
    if (!siteButton) return;
    const site = getBuildSite(siteId);
    const structure = structures.get(siteId);
    const runtime = structure ? ensureStructureRuntime(structure) : null;
    delete siteButton.dataset.element;
    siteButton.classList.remove(...structureClassNames);
    siteButton.classList.toggle('has-structure', Boolean(structure) && runtime !== null && runtime.hp > 0);
    if (structure && runtime !== null && runtime.hp > 0){
      if (structure.type === 'elementalTower' || structure.mountedStructure === 'elementalTower') siteButton.dataset.element = structure.element ?? 'Hỏa';
      siteButton.classList.add(`vinh-da-game__structure--${structure.type}`);
      if (structure.mountedStructure) siteButton.classList.add(`vinh-da-game__structure--${structure.mountedStructure}`);
    }
    const structureLabel = structure ? buildNodeOptions.find(option => option.type === structure.type)?.label ?? '' : '';
    const mountedLabel = structure?.mountedStructure ? buildNodeOptions.find(option => option.type === structure.mountedStructure)?.label ?? structure.mountedStructure : '';
    const elementalLabel = structure?.type === 'elementalTower' || structure?.mountedStructure === 'elementalTower' ? ` (${structure.element ?? 'Hỏa'})` : '';
    siteButton.dataset.structureLabel = structure && mountedLabel ? `${structureLabel}${elementalLabel} Lv${structure.level} + ${mountedLabel} Lv${structure.mountedLevel ?? 1}` : `${structureLabel}${elementalLabel}`;
    const stat = structure ? getStructureLevelStat(structure.type, structure.level, structure.type === 'crystalSeal' ? structure.baseBranchLv3 : structure.branchLv3, structure.branchLv5, structure.element) : null;
    const branchText = structure?.type === 'wall' ? ` · tường lãnh địa · lv3 ${structure.branchLv3 ?? 'chưa chọn'} · lv5 ${structure.branchLv5 ?? 'chưa chọn'}` : structure?.type === 'crystalSeal' ? ` · base lv3 ${structure.baseBranchLv3 ?? 'chưa chọn'}` : '';
    const elementText = structure?.type === 'elementalTower' || structure?.mountedStructure === 'elementalTower' ? ` · hệ ${structure.element ?? 'Hỏa'} · ${describeElementEffect(structure.element ?? 'Hỏa')}` : '';
    const soldierText = structure?.type === 'barracks' ? ` · lính ${runtime?.soldiers?.length ?? 0}/${stat?.soldierCap ?? 0} rank ${stat?.soldierRank ?? 1}` : '';
    const churchText = structure?.type === 'church' ? ` · prayer ${formatSeconds(runtime?.prayerTimer)} cleanse ${formatSeconds(runtime?.contaminationCleanseTimer)}` : '';
    const teleportText = structure?.type === 'teleport' ? ` · rút lui CD ${formatSeconds(runtime?.cooldown)}` : '';
    siteButton.title = structure ? `${siteButton.dataset.structureLabel} Lv${structure.level} · HP ${Math.ceil(runtime?.hp ?? 0)}/${stat?.hp ?? 0} · cost ${formatCost(getCostFor(structure.type, structure.level, structure.branchLv5 ?? structure.baseBranchLv3 ?? structure.branchLv3))}${stat?.range ? ` · range ${stat.range}` : ''}${branchText}${elementText}${soldierText}${churchText}${teleportText}` : site?.kind === 'wall-slot' ? 'Điểm xây tường lãnh địa' : site?.kind === 'ground' ? 'Điểm đất cho bẫy' : 'Ụ đá cho tháp/trại/Nhà Thờ';
    siteButton.setAttribute('aria-label', structure ? siteButton.title : site?.kind === 'wall-slot' ? 'Điểm xây tường lãnh địa' : site?.kind === 'ground' ? 'Điểm đất xây dựng' : 'Ụ đá xây dựng');
    renderBuildMenu(siteId);
  };

  const createElementalRegionElement = (region: ElementalRegion): void => {
    if (!elementalRegionsContainer || elementalRegionElements.has(region.id)) return;
    const element = document.createElement('div');
    element.className = `vinh-da-game__element-region vinh-da-game__element-region--${region.kind}`;
    element.dataset.elementalRegionId = region.id;
    element.style.left = `${region.startX}px`;
    element.style.width = `${Math.max(0, region.endX - region.startX)}px`;
    const particleCount = getElementalRegionParticleCount(region);
    for (let index = 0; index < particleCount; index += 1){
      const particle = document.createElement('span');
      particle.className = 'vinh-da-game__element-region-particle';
      particle.style.left = `${((index * 73 + region.startX) % 100)}%`;
      particle.style.animationDelay = `${-((index * 0.37) % 3.8)}s`;
      particle.style.animationDuration = `${3.2 + ((index + region.id.length) % 4) * 0.45}s`;
      element.append(particle);
    }
    elementalRegionsContainer.append(element);
    elementalRegionElements.set(region.id, element);
  };
  const renderVisibleElementalRegions = (): void => {
    const width = viewport?.clientWidth || window.innerWidth || 1;
    const minX = cameraX - ELEMENTAL_REGION_RENDER_BUFFER;
    const maxX = cameraX + width + ELEMENTAL_REGION_RENDER_BUFFER;
    for (const [regionId, regionElement] of elementalRegionElements){
      const region = elementalRegionsById.get(regionId);
      if (!region || region.endX < minX || region.startX > maxX){
        regionElement.remove();
        elementalRegionElements.delete(regionId);
      }
    }
    for (const region of elementalRegions){
      if (region.endX < minX) continue;
      if (region.startX > maxX) break;
      createElementalRegionElement(region);
    }
  };
  const renderVisibleBuildSites = (): void => {
    const width = viewport?.clientWidth || window.innerWidth || 1;
    const minX = cameraX - BUILD_SITE_RENDER_BUFFER;
    const maxX = cameraX + width + BUILD_SITE_RENDER_BUFFER;

    for (const [siteId, siteElement] of siteElements){
      const site = getBuildSite(siteId);
      const structure = structures.get(siteId);
      const shouldKeepGroundSite = site?.kind !== 'ground' || groundPlotsVisible || Boolean(structure);
      if (site && site.id !== openSiteId && (site.x < minX || site.x > maxX || !shouldKeepGroundSite)){
        const menuElement = buildMenuElements.get(site.id);
        siteElement.remove();
        menuElement?.remove();
        siteElements.delete(site.id);
        buildMenuElements.delete(site.id);
      }
    }

    for (const site of buildSitesByX){
      if (site.x < minX) continue;
      if (site.x > maxX) break;
      const structure = structures.get(site.id);
      const shouldRenderGroundSite = site.kind !== 'ground' || groundPlotsVisible || Boolean(structure);
      if (shouldRenderGroundSite) createBuildSiteElement(site);
    }
    lastRenderedCameraX = cameraX;
  };
  const setOpenBuildSite = (siteId: string | null): void => {
    openSiteId = siteId;
    selectedGroundPlotId = getBuildSite(siteId)?.kind === 'ground' ? siteId : null;
    if (siteId) renderBuildMenu(siteId);
    for (const menu of buildMenuElements.values()) menu.classList.toggle('is-open', menu.dataset.buildMenu === siteId);
  };
  const setGroundPlotsVisible = (visible: boolean): void => {
    if (groundPlotsVisible === visible) return;
    groundPlotsVisible = visible;
    if (!visible) selectedGroundPlotId = null;
    renderVisibleBuildSites();
    renderVisibleElementalRegions();
  };

  const simulationState: VinhDaSimulationState = {
    get bloodSealStone(){ return bloodSealStone; },
    set bloodSealStone(value: number){ bloodSealStone = value; },
    get carriedDaThach(){ return carriedDaThach; },
    set carriedDaThach(value: number){ carriedDaThach = value; },
    carriedResources,
    baseStoredResources,
    get baseLiquidHnt(){ return baseLiquidHnt; },
    set baseLiquidHnt(value: number | undefined){ baseLiquidHnt = value ?? 0; },
    get condensedHnt(){ return condensedHnt; },
    set condensedHnt(value: number | undefined){ condensedHnt = value ?? 0; bloodSealStone = condensedHnt; },
    get baseEnergyShortage(){ return baseEnergyShortage; },
    set baseEnergyShortage(value: boolean | undefined){ baseEnergyShortage = Boolean(value); },
    droppedResources,
    nextDroppedResourceId,
    lootRng,
    get baseHp(){ return baseHp; },
    set baseHp(value: number){ baseHp = value; },
    get baseLevel(){ return baseLevel; },
    set baseLevel(value: number | undefined){ baseLevel = value ?? 0; },
    get baseBranchLv3(){ return baseBranchLv3; },
    set baseBranchLv3(value: BaseBranchLv3 | undefined){ baseBranchLv3 = value; },
    get baseX(){ return baseX; },
    set baseX(value: number | undefined){ baseX = Number.isFinite(value) ? value! : CRYSTAL_X; },
    baseStatuses,
    get leaderHp(){ return leaderHp; },
    set leaderHp(value: number){ leaderHp = value; },
    get leaderMaxHp(){ return leaderMaxHp; },
    set leaderMaxHp(value: number){ leaderMaxHp = value; },
    get leaderShield(){ return leaderShield; },
    set leaderShield(value: number){ leaderShield = value; },
    get leaderShieldNightIndex(){ return leaderShieldNightIndex; },
    set leaderShieldNightIndex(value: number | undefined){ leaderShieldNightIndex = value; },
    get leaderEmergencyCooldownUntilNight(){ return leaderEmergencyCooldownUntilNight; },
    set leaderEmergencyCooldownUntilNight(value: number | undefined){ leaderEmergencyCooldownUntilNight = value ?? 0; },
    get leaderX(){ return leaderX; },
    set leaderX(value: number){ leaderX = value; },
    enemies,
    enemyPortals,
    nextEnemyId,
    enemySpawnTimer,
    dayNightPhase,
    phaseRemainingSeconds,
    leaderAttackCooldown,
    structures,
    nightIndex,
    mapTier: mapTier as VinhDaSimulationState['mapTier'],
    waveThreatBudgetRemaining,
    elementalRegions,
  };
  const simulationContext: VinhDaSimulationContext = {
    state: simulationState,
    structureSitesByType,
    getBuildSite,
    ensureStructureRuntime,
    getStructureMaxHp,
    deleteStructure,
    structureSiteIdsOfType,
    renderEconomy,
    renderDroppedResources,
    renderBuildSite,
    renderDayNightTimer,
    removeEnemyElement(enemyId: number): void {
      enemyElements.get(enemyId)?.remove();
      enemyElements.delete(enemyId);
    }
  };
  const syncSimulationState = (): void => {
    nextEnemyId = simulationState.nextEnemyId;
    enemySpawnTimer = simulationState.enemySpawnTimer;
    dayNightPhase = simulationState.dayNightPhase;
    phaseRemainingSeconds = simulationState.phaseRemainingSeconds;
    baseX = getBaseX(simulationState);
    leaderAttackCooldown = simulationState.leaderAttackCooldown;
    nightIndex = simulationState.nightIndex;
    waveThreatBudgetRemaining = simulationState.waveThreatBudgetRemaining;
    nextDroppedResourceId = simulationState.nextDroppedResourceId;
    leaderHp = simulationState.leaderHp ?? leaderHp;
    leaderMaxHp = simulationState.leaderMaxHp ?? leaderMaxHp;
    leaderShield = simulationState.leaderShield ?? leaderShield;
    leaderShieldNightIndex = simulationState.leaderShieldNightIndex;
    leaderEmergencyCooldownUntilNight = simulationState.leaderEmergencyCooldownUntilNight ?? leaderEmergencyCooldownUntilNight;
    baseLevel = simulationState.baseLevel ?? baseLevel;
    baseBranchLv3 = simulationState.baseBranchLv3 ?? baseBranchLv3;
    baseLiquidHnt = simulationState.baseLiquidHnt ?? baseLiquidHnt;
    condensedHnt = simulationState.condensedHnt ?? condensedHnt;
    bloodSealStone = condensedHnt || simulationState.bloodSealStone;
    baseEnergyShortage = Boolean(simulationState.baseEnergyShortage);
  };
  const spawnWaveEnemy = (side: Side): void => { runtimeSpawnWaveEnemy(simulationContext, side); syncSimulationState(); };
  const removeEnemyAt = (index: number, reward: boolean): void => { runtimeRemoveEnemyAt(simulationContext, index, reward); syncSimulationState(); };
  const clearEnemiesWithoutReward = (): void => { runtimeClearEnemiesWithoutReward(simulationContext); syncSimulationState(); };
  const damageStructure = (site: BuildSite, runtime: StructureRuntime, amount: number, attacker: Enemy | null = null): boolean => {
    const destroyed = runtimeDamageStructure(simulationContext, site, runtime, amount, attacker);
    syncSimulationState();
    return destroyed;
  };
  const damageBase = (amount: number): boolean => { const destroyed = runtimeDamageBase(simulationContext, amount); syncSimulationState(); return destroyed; };
  const updateEnemies = (dt: number): void => { runtimeUpdateEnemies(simulationContext, dt); syncSimulationState(); };
  const updateDayNightTimer = (dt: number): void => {
    if (canStartEscort(simulationContext) && simulationState.dayNightPhase === 'day' && simulationState.enemies.length === 0) startEscort(simulationContext);
    const wasNight = simulationState.dayNightPhase === 'night';
    const enemyCountBefore = simulationState.enemies.length;
    runtimeUpdateDayNightTimer(simulationContext, dt);
    if (wasNight && simulationState.dayNightPhase === 'day' && enemyCountBefore > 0) showNotice('Ánh sáng thiêu đốt quái còn sót lại');
    syncSimulationState();
  };
  const updateStructures = (dt: number): void => { runtimeUpdateStructures(simulationContext, dt); syncSimulationState(); };
  const collectDroppedResources = (): void => { runtimeCollectDroppedResources(simulationContext); syncSimulationState(); };
  escortStartButton?.addEventListener('click', () => {
    if (startEscort(simulationContext)) showNotice('Bắt đầu hộ tống pha lê tới điểm phong ấn');
    else showNotice('Chưa đủ điều kiện hộ tống');
    syncSimulationState();
  });

  function renderDroppedResources(): void {
    if (!droppedResourcesContainer) return;
    for (const resource of droppedResources){
      let element = droppedResourceElements.get(resource.id);
      if (!element){
        element = document.createElement('div');
        element.className = 'vinh-da-game__drop';
        element.title = `${getResourceLabel(resource.resourceId)}${resource.tier ? ` ${resource.tier}` : ''} +${resource.amount}`;
        droppedResourcesContainer.append(element);
        droppedResourceElements.set(resource.id, element);
      }
      element.style.transform = `translate3d(${resource.x}px,0,0)`;
    }
    for (const [id, element] of droppedResourceElements){
      if (!droppedResources.some(resource => resource.id === id)){
        element.remove();
        droppedResourceElements.delete(id);
      }
    }
  }

  const renderEnemyPortals = (): void => {
    if (!enemyPortalsContainer) return;
    enemyPortalsContainer.replaceChildren(...enemyPortals.map(portal => {
      const element = document.createElement('div');
      element.className = 'vinh-da-game__portal';
      element.style.transform = `translate3d(${portal.x}px,0,0)`;
      element.title = portal.side === 'left' ? 'Cổng địch trái' : 'Cổng địch phải';
      return element;
    }));
  };

  const renderEnemies = (): void => {
    if (!enemiesContainer) return;
    const width = viewport?.clientWidth || window.innerWidth || 1;
    const minX = cameraX - BUILD_SITE_RENDER_BUFFER;
    const maxX = cameraX + width + BUILD_SITE_RENDER_BUFFER;
    for (const enemy of enemies){
      let element = enemyElements.get(enemy.id);
      const visible = enemy.x >= minX && enemy.x <= maxX;
      if (!visible){
        element?.remove();
        enemyElements.delete(enemy.id);
        continue;
      }
      if (!element){
        element = document.createElement('div');
        element.className = 'vinh-da-game__enemy';
        enemiesContainer.append(element);
        enemyElements.set(enemy.id, element);
      }
      element.style.transform = `translate3d(${enemy.x}px,0,0)`;
    }
  };

  const updateCamera = (): void => {
    const width = viewport?.clientWidth || window.innerWidth || 1;
    cameraX = Math.max(0, Math.min(WORLD_WIDTH - width, leaderX - width * 0.5));
    if (world) world.style.transform = `translate3d(${-cameraX}px,0,0)`;
    if (openSiteId && !nearestBuildSite()) setOpenBuildSite(null);
    if (Math.abs(cameraX - lastRenderedCameraX) > BUILD_SITE_RENDER_THRESHOLD){
      renderVisibleBuildSites();
      renderVisibleElementalRegions();
    }
    if (castleElement) castleElement.style.left = `${getBaseX(simulationState) - CASTLE_WIDTH * 0.5}px`;
    if (crystalElement) crystalElement.style.left = `${getBaseX(simulationState)}px`;
    if (sprite) sprite.style.transform = `translate3d(${leaderX}px,0,0)`;
  };

  const tick = (now: number): void => {
    rafId = window.requestAnimationFrame(tick);
    if (now - lastFrameTime < minFrameMs) return;
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    lastFrameTime = now;
    const left = keys.has('arrowleft') || keys.has('a');
    const right = keys.has('arrowright') || keys.has('d');
    const keyboardDirection = Number(right) - Number(left);
    if (keyboardDirection !== 0) targetX = leaderX;
    leaderX += keyboardDirection !== 0
      ? keyboardDirection * LEADER_SPEED * dt
      : Math.max(-LEADER_SPEED * dt, Math.min(LEADER_SPEED * dt, targetX - leaderX));
    leaderX = clampLeaderX(leaderX);
    updateDayNightTimer(dt);
    updateWeatherScheduler(dt);
    renderWeather();
    updateEnemies(dt);
    updateStructures(dt);
    collectDroppedResources();
    updateCamera();
    renderEnemies();
    renderStatusPanel();
  };

  const moveToClientX = (clientX: number): void => {
    targetX = clampLeaderX(clientX + cameraX - LEADER_WIDTH * 0.5);
    setOpenBuildSite(null);
  };
  const onViewportPointerDown = (event: PointerEvent): void => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('[data-build-site-id],.vinh-da-game__build-node,.vinh-da-game__back')) return;
    if (isGroundClick(event)){
      moveToClientX(event.clientX);
      setGroundPlotsVisible(true);
      return;
    }
    moveToClientX(event.clientX);
    setGroundPlotsVisible(false);
  };
  const onGameClick = (event: Event): void => {
    const target = event.target instanceof Element ? event.target : null;
    const buildNode = target?.closest<HTMLElement>('.vinh-da-game__build-node');
    if (buildNode){
      const site = getBuildSite(openSiteId);
      const structure = site ? structures.get(site.id) : null;
      const action = buildNode.dataset.action;
      if (site && structure && action){
        const nextLevel = structure.level + 1;
        if (action === 'upgrade' && structure.level < 6 && !(structure.level === 2 && (structure.type === 'wall' || structure.type === 'crystalSeal')) && !(structure.level === 4 && structure.type === 'wall') && spend(getCostFor(structure.type, nextLevel))){
          const upgraded = { ...structure, level: nextLevel };
          setStructure(upgraded);
          const runtime = ensureStructureRuntime(upgraded);
          runtime.hp = getStructureMaxHp(upgraded);
          renderBuildSite(site.id);
          } else if (structure.type === 'wall' && structure.level === 2 && action.startsWith('branch-lv3-') && spend(getCostFor(structure.type, 3, action.slice('branch-lv3-'.length) as Parameters<typeof getStructureUpgradeCost>[2]))){
          const upgraded = { ...structure, level: 3, branchLv3: action.slice('branch-lv3-'.length) as WallBranchLv3 };
          setStructure(upgraded);
          ensureStructureRuntime(upgraded).hp = getStructureMaxHp(upgraded);
          renderBuildSite(site.id);
          } else if (structure.type === 'crystalSeal' && structure.level === 2 && action.startsWith('base-branch-lv3-') && spend(getCostFor(structure.type, 3, action.slice('base-branch-lv3-'.length) as Parameters<typeof getStructureUpgradeCost>[2]))){
          const upgraded = { ...structure, level: 3, baseBranchLv3: action.slice('base-branch-lv3-'.length) as BaseBranchLv3 };
          setStructure(upgraded);
          ensureStructureRuntime(upgraded).hp = getStructureMaxHp(upgraded);
          renderBuildSite(site.id);
          } else if (structure.type === 'gravityCannon' && structure.level >= 6 && action === 'toggle-gravity'){
          const runtime = ensureStructureRuntime(structure);
          runtime.gravityEnabled = !(runtime.gravityEnabled ?? true);
          renderBuildSite(site.id);
          } else if ((structure.type === 'elementalTower' || structure.mountedStructure === 'elementalTower') && action === 'cycle-element'){
          const currentIndex = ELEMENTAL_TOWER_ELEMENTS.indexOf(structure.element ?? 'Hỏa');
          const element = ELEMENTAL_TOWER_ELEMENTS[(currentIndex + 1) % ELEMENTAL_TOWER_ELEMENTS.length] ?? 'Hỏa';
          const upgraded = { ...structure, element };
          setStructure(upgraded);
          renderBuildSite(site.id);
          showNotice(`Tháp Nguyên Tố chuyển hệ ${element}`);
        } else if (structure.type === 'teleport' && action === 'activate-teleport'){
          const result = activateTeleportRetreat(simulationContext);
          syncSimulationState();
          if (!result.ok){
            showNotice(result.reason === 'cooldown' ? `Truyền tống hồi sau ${formatSeconds(result.cooldownSeconds)}` : result.reason === 'insufficient-resource' ? `Cần ${TELEPORT_RETREAT_COST} Dạ Thạch để rút lui` : 'Không thể kích hoạt truyền tống');
            renderBuildSite(site.id);
            return;
          }
          clearEnemiesWithoutReward();
          showNotice(`Truyền tống về map cũ đã phong ấn · mất ${result.lostBloodSealStone} Dạ Thạch`);
          shell?.enterScreen?.('campaign-world-map', { modeKey: 'vinh-da', leaderId, stageId: params?.stageId, retreatedFromVinhDa: true, sealedOldMap: true, bloodSealStone: result.bloodSealStoneAfter, carriedDaThach: result.carriedDaThachAfter });
        } else if (structure.type === 'wall' && structure.level === 4 && action.startsWith('branch-lv5-') && spend(getCostFor(structure.type, 5, action.slice('branch-lv5-'.length) as Parameters<typeof getStructureUpgradeCost>[2]))){
          const upgraded = { ...structure, level: 5, branchLv5: action.slice('branch-lv5-'.length) as WallBranchLv5 };
          setStructure(upgraded);
          ensureStructureRuntime(upgraded).hp = getStructureMaxHp(upgraded);
          renderBuildSite(site.id);
        }
      } else {
        const type = buildNode.dataset.structureType as StructureType | undefined;
        const buildElement = action?.startsWith('build-element-') ? action.slice('build-element-'.length) as ElementalTowerElement : undefined;
        if (site && buildElement && !structure && isStructureAllowedOnBuildSite('elementalTower', site) && spend(getCostFor('elementalTower', 1))){
          const placed = { siteId: site.id, type: 'elementalTower' as const, level: 1, element: buildElement };
          setStructure(placed);
          ensureStructureRuntime(placed);
          renderBuildSite(site.id);
          showNotice(`Xây Tháp Nguyên Tố hệ ${buildElement}`);
        } else if (site && buildElement && structure?.type === 'wall' && structure.level >= 6 && !structure.mountedStructure && spend(getCostFor('elementalTower', 1))){
          const upgraded = { ...structure, mountedStructure: 'elementalTower' as const, mountedLevel: 1, element: buildElement };
          setStructure(upgraded);
          renderBuildSite(site.id);
          showNotice(`Gắn Tháp Nguyên Tố hệ ${buildElement}`);
        } else if (site && type && structure?.type === 'wall' && structure.level >= 6 && !structure.mountedStructure && type !== 'wall' && type !== 'elementalTower' && isStructureAllowedOnBuildSite(type, { kind: 'rock' }) && spend(getCostFor(type, 1))){
          const upgraded = { ...structure, mountedStructure: type, mountedLevel: 1 };
          setStructure(upgraded);
          renderBuildSite(site.id);
        } else if (site && type && type !== 'elementalTower' && !structure && isStructureAllowedOnBuildSite(type, site) && spend(getCostFor(type, 1))){
          const placed = { siteId: site.id, type, level: 1 };
          setStructure(placed);
          ensureStructureRuntime(placed);
          renderBuildSite(site.id);
        }
      }
      setOpenBuildSite(null);
      setGroundPlotsVisible(false);
      return;
    }

    const siteButton = target?.closest<HTMLElement>('[data-build-site-id]');
    if (!siteButton) return;
    const site = nearestBuildSite();
    if (!site || site.id !== siteButton.dataset.buildSiteId){
      targetX = clampLeaderX(Number.parseFloat(siteButton.style.left) || leaderX);
      setOpenBuildSite(null);
      if (getBuildSite(siteButton.dataset.buildSiteId)?.kind !== 'ground') setGroundPlotsVisible(false);
      return;
    }
    selectedGroundPlotId = site.kind === 'ground' ? site.id : null;
    if (site.kind !== 'ground') setGroundPlotsVisible(false);
    setOpenBuildSite(openSiteId === site.id ? null : site.id);
  };
  const onViewportResize = (): void => { renderVisibleBuildSites(); renderVisibleElementalRegions(); };
  const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onViewportResize);
  const unlockAudio = (): void => { audio.unlock(); audio.syncWeather(weather); };
  const onKeyDown = (event: KeyboardEvent): void => { unlockAudio(); keys.add(event.key.toLowerCase()); };
  const onKeyUp = (event: KeyboardEvent): void => { keys.delete(event.key.toLowerCase()); };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  if (viewport) resizeObserver?.observe(viewport);
  viewport?.addEventListener('pointerdown', unlockAudio);
  viewport?.addEventListener('pointerdown', onViewportPointerDown);
  section.addEventListener('click', unlockAudio);
  section.addEventListener('click', onGameClick);
  section.querySelector('.vinh-da-game__back')?.addEventListener('click', () => {
    shell?.enterScreen?.('campaign-world-map', { modeKey: 'vinh-da', leaderId, stageId: params?.stageId });
  });
  weather = chooseWeather();
  updateCamera();
  renderDayNightTimer();
  renderWeather();
  audio.syncWeather(weather);
  renderEnemyPortals();
  spawnWaveEnemy('left');
  spawnWaveEnemy('right');
  renderEnemies();
  rafId = window.requestAnimationFrame(tick);

  return {
    destroy(){
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      resizeObserver?.disconnect();
      clearEnemiesWithoutReward();
      viewport?.removeEventListener('pointerdown', onViewportPointerDown);
      viewport?.removeEventListener('pointerdown', unlockAudio);
      section.removeEventListener('click', unlockAudio);
      section.removeEventListener('click', onGameClick);
      audio.destroy();
      mount.destroy();
    }
  };
}

export const render = renderScreen;
