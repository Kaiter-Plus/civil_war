import type { DifficultyConfig, DifficultyName } from './types';

// 图片资源
import logoImg from '../assets/img/logo.png';
import ambulanceImg from '../img/ambulance.png';
import capsuleImg from '../img/capsule.png';
import virusImg from '../img/virus.png';
import killedImg from '../assets/img/killed.png';
import isDestroyImg from '../assets/img/isDestroy.png';

// 音频资源
import buttonMp3 from '../music/buttonDown/button.mp3';
import startMp3 from '../music/start/start.mp3';
import bgMusicMp3 from '../music/backgroundMusic/backgroundMusic.mp3';
import shotMp3 from '../music/shot/shot.mp3';
import killedMp3 from '../music/killed/killed.mp3';
import gameOverMp3 from '../music/gameOver/gameOver.mp3';

// JSON 数据
import rulesData from '../assets/json/rules.json';
import knowledgeData from '../assets/json/knowledge.json';
import rumorsData from '../assets/json/rumors.json';

export const images = {
  logo: logoImg,
  ambulance: ambulanceImg,
  capsule: capsuleImg,
  virus: virusImg,
  killed: killedImg,
  isDestroy: isDestroyImg,
} as const;

export const audio = {
  button: buttonMp3,
  start: startMp3,
  bgMusic: bgMusicMp3,
  shot: shotMp3,
  killed: killedMp3,
  gameOver: gameOverMp3,
} as const;

export const data = {
  rules: rulesData,
  knowledge: knowledgeData,
  rumors: rumorsData as [string, string][],
} as const;

/** 难度配置表 */
export const difficulties: Record<DifficultyName, DifficultyConfig> = {
  easy: {
    capsuleSpeed: 2000,
    capsuleInterval: 300,
    virusSpeedMin: 2500,
    virusSpeedMax: 5000,
    virusInterval: 800,
    label: '简单',
    accelEvery: 5,
    accelInterval: 30,
    accelSpeedMin: 100,
    accelSpeedMax: 200,
    intervalFloor: 500,
  },
  normal: {
    capsuleSpeed: 2000,
    capsuleInterval: 260,
    virusSpeedMin: 1500,
    virusSpeedMax: 4500,
    virusInterval: 600,
    label: '普通',
    accelEvery: 5,
    accelInterval: 25,
    accelSpeedMin: 80,
    accelSpeedMax: 150,
    intervalFloor: 350,
  },
  hard: {
    capsuleSpeed: 1500,
    capsuleInterval: 200,
    virusSpeedMin: 1000,
    virusSpeedMax: 3000,
    virusInterval: 400,
    label: '困难',
    accelEvery: 5,
    accelInterval: 20,
    accelSpeedMin: 60,
    accelSpeedMax: 120,
    intervalFloor: 200,
  },
};
