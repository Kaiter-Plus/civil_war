/** 游戏难度配置 */
export interface DifficultyConfig {
  /** 胶囊飞行时间 (ms) */
  capsuleSpeed: number;
  /** 胶囊发射间隔 (ms) */
  capsuleInterval: number;
  /** 病毒最小飞行时间 (ms) */
  virusSpeedMin: number;
  /** 病毒最大飞行时间 (ms) */
  virusSpeedMax: number;
  /** 病毒出现间隔 (ms) */
  virusInterval: number;
  /** 显示名称 */
  label: string;
}

/** 游戏定时器（菜单阶段用） */
export interface GameTimers {
  ready: ReturnType<typeof setInterval> | null;
  backgroundMusic: ReturnType<typeof setTimeout> | null;
}

/** 结算等级 */
export type ResultLevel = 0 | 1 | 2 | 3;

/** 游戏状态 */
export type GameState = 'menu' | 'ready' | 'playing' | 'over';

/** 难度名称 */
export type DifficultyName = 'easy' | 'normal' | 'hard';

/** 胶囊实体 */
export interface CapsuleEntity {
  x: number;
  y: number;
  /** 向上飞行速度 (px/ms) */
  vy: number;
  active: boolean;
}

/** 病毒实体 */
export interface VirusEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  /** 水平漂移速度 (px/ms) */
  vx: number;
  /** 垂直下落速度 (px/ms) */
  vy: number;
  /** 旋转角度 (弧度) */
  rotation: number;
  /** 旋转速度 (弧度/ms) */
  rotationSpeed: number;
  active: boolean;
  /** 被击杀后的显示计时 */
  killedAt: number | null;
}

/** 粒子效果 */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

/** 游戏实体尺寸常量 */
export const SIZES = {
  ambulance: { width: 30, height: 64 },
  capsule: { width: 14, height: 26 },
  virus: { width: 64, height: 64 },
} as const;
