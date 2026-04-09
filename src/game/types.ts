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

/** 游戏定时器 */
export interface GameTimers {
  capsule: ReturnType<typeof setInterval> | null;
  virus: ReturnType<typeof setInterval> | null;
  backgroundMusic: ReturnType<typeof setTimeout> | null;
  startGame: ReturnType<typeof setTimeout> | null;
}

/** 谣言条目 */
export interface RumorEntry {
  /** 谣言内容 */
  rumor: string;
  /** 真相 */
  truth: string;
}

/** 结算等级 */
export type ResultLevel = 0 | 1 | 2 | 3;

/** 游戏状态 */
export type GameState = 'menu' | 'ready' | 'playing' | 'over';
