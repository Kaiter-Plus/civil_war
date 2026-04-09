import type { GameState, GameTimers, DifficultyName, CapsuleEntity, VirusEntity, Particle, DifficultyConfig } from './types';
import { difficulties, data, audio as audioSrc, images as imageSrcs } from './config';
import { audioManager } from './audio';
import { randomInt, clamp, isMobile } from './utils';
import { Renderer } from './renderer';
import { SIZES } from './types';

/** 游戏主类 */
export class Game {
  private stage: HTMLElement;
  private renderer: Renderer;
  private canvas: HTMLCanvasElement;
  private state: GameState = 'menu';
  private difficulty: DifficultyName = 'normal';
  private score = 0;

  // 救护车位置（中心X, 顶部Y）
  private ambulanceX = 0;
  private ambulanceY = 0;

  // 实体数组
  private capsules: CapsuleEntity[] = [];
  private viruses: VirusEntity[] = [];
  private particles: Particle[] = [];

  // 游戏循环
  private gameLoopRAF = 0;
  private lastTime = 0;
  private capsuleAccum = 0;
  private virusAccum = 0;

  // 菜单阶段定时器
  private timers: GameTimers = {
    ready: null,
    backgroundMusic: null,
  };

  private moveHandler: ((e: Event) => void) | null = null;
  private modalEl: HTMLElement | null = null;

  constructor(stageId: string) {
    this.stage = document.getElementById(stageId)!;

    // 创建 Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '1';
    this.stage.appendChild(this.canvas);

    this.renderer = new Renderer(this.canvas);

    // 加载音频
    audioManager.init(audioSrc);
  }

  /** 启动 — 预加载资源后绘制菜单 */
  async start(): Promise<void> {
    await this.renderer.loadImages(imageSrcs as any);
    this.drawMenu();
  }

  // ======================== 菜单 ========================

  private drawMenu(): void {
    this.canvas.style.display = 'none';

    // Logo
    const title = document.createElement('div');
    title.className = 'title';
    const logoDiv = document.createElement('div');
    logoDiv.className = 'logo';
    const logoImg = document.createElement('img');
    logoImg.alt = '全民战疫';
    logoImg.src = imageSrcs.logo;
    logoImg.className = 'img-fluid';
    logoImg.style.userSelect = 'none';
    logoDiv.appendChild(logoImg);
    title.appendChild(logoDiv);
    this.stage.appendChild(title);

    // 难度选择
    const diffGroup = document.createElement('div');
    diffGroup.className = 'difficultyGroup col-8 mb-3';
    diffGroup.innerHTML = `
      <div class="btn-group w-100" role="group">
        <button type="button" class="btn btn-outline-light diff-btn" data-diff="easy">简单</button>
        <button type="button" class="btn btn-outline-light diff-btn active-selected" data-diff="normal">普通</button>
        <button type="button" class="btn btn-outline-light diff-btn" data-diff="hard">困难</button>
      </div>`;
    this.stage.appendChild(diffGroup);

    diffGroup.querySelectorAll('.diff-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        diffGroup.querySelectorAll('.diff-btn').forEach((b) => b.classList.remove('active-selected'));
        btn.classList.add('active-selected');
        this.difficulty = (btn as HTMLElement).dataset.diff! as DifficultyName;
      });
    });

    // 按钮组
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'buttonGroup col-8';
    buttonGroup.innerHTML = `
      <a class="btn btn-block btn-lg btn-success" href="javascript:;">开始游戏</a>
      <a class="btn btn-block btn-lg btn-primary" href="javascript:;">查看规则</a>
      <a class="btn btn-block btn-lg btn-warning" href="javascript:;">防疫小知识</a>
      <a class="btn btn-block btn-lg btn-danger" href="javascript:;">谣言我先知</a>`;
    this.stage.appendChild(buttonGroup);

    buttonGroup.querySelectorAll('a').forEach((btn, index) => {
      btn.addEventListener('click', () => this.onMenuClick(index));
    });
  }

  private onMenuClick(index: number): void {
    switch (index) {
      case 0: this.beginGame(); break;
      case 1:
        this.showModal('游戏规则', data.rules.join('\n'));
        break;
      case 2:
        this.showModal('防疫小知识', data.knowledge[randomInt(0, data.knowledge.length)]);
        break;
      case 3: {
        const [rumor, truth] = data.rumors[randomInt(0, data.rumors.length)];
        this.showModal('谣言我先知', `<div class="rumor">${rumor}</div><div class="truth">${truth}</div>`);
        break;
      }
    }
  }

  // ======================== 自定义 Modal ========================

  private showModal(title: string, content: string): void {
    this.hideModal();
    const modal = document.createElement('div');
    modal.className = 'game-modal-overlay';
    modal.innerHTML = `
      <div class="game-modal">
        <div class="game-modal-header">
          <h5>${title}</h5>
          <button class="game-modal-close" aria-label="关闭">&times;</button>
        </div>
        <div class="game-modal-body">${content}</div>
        <div class="game-modal-footer">
          <button class="btn btn-success">我知道了</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    this.modalEl = modal;

    modal.querySelector('.game-modal-close')!.addEventListener('click', () => this.hideModal());
    modal.querySelector('.btn-success')!.addEventListener('click', () => this.hideModal());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.hideModal();
    });
  }

  private hideModal(): void {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }

  // ======================== 游戏流程 ========================

  private beginGame(): void {
    this.hideModal();
    this.state = 'ready';
    this.stage.style.cursor = 'none';

    // 清除菜单 DOM（保留 canvas）
    Array.from(this.stage.children).forEach(child => {
      if (child !== this.canvas) child.remove();
    });
    this.canvas.style.display = 'block';
    this.renderer.resize();

    const { width, height } = this.renderer.getSize();

    // 重置状态
    this.score = 0;
    this.capsules = [];
    this.viruses = [];
    this.particles = [];
    this.capsuleAccum = 0;
    this.virusAccum = 0;

    // 初始救护车位置
    this.ambulanceX = width / 2;
    this.ambulanceY = height / 2 + 64;

    // Ready -> GO 动画（用 canvas 绘制）
    audioManager.play('button');
    audioManager.play('start');

    this.timers.backgroundMusic = setTimeout(() => audioManager.fadeInBgMusic(2000), 1500);

    let readyPhase = 'ready';
    let fontSize = 16;
    this.timers.ready = setInterval(() => {
      this.renderer.clear();
      if (readyPhase === 'ready') {
        fontSize += 1.5;
        this.renderer.drawReadyText('Ready', fontSize);
        if (fontSize >= 80) readyPhase = 'go';
      } else {
        this.renderer.drawReadyText('GO!', 80);
        // 淡出由 drawReadyText 内部处理
        fontSize += 2;
        if (fontSize >= 140) {
          clearInterval(this.timers.ready!);
          this.startPlaying();
        }
      }
    }, 16);

    // 注册移动控制
    if (isMobile()) {
      this.moveHandler = (e: Event) => {
        e.preventDefault();
        const touch = (e as TouchEvent).changedTouches[0];
        this.handleMove(touch.clientX, touch.clientY);
      };
      document.addEventListener('touchmove', this.moveHandler, { passive: false });
    } else {
      this.moveHandler = (e: Event) => this.handleMove((e as MouseEvent).clientX, (e as MouseEvent).clientY);
      document.addEventListener('mousemove', this.moveHandler);
    }
  }

  private startPlaying(): void {
    this.state = 'playing';
    this.lastTime = performance.now();
    this.gameLoopRAF = requestAnimationFrame(this.gameLoop);
  }

  // ======================== 游戏主循环 ========================

  private gameLoop = (now: number): void => {
    if (this.state !== 'playing') return;

    const dt = Math.min(now - this.lastTime, 50); // 上限 50ms 防跳帧
    this.lastTime = now;

    const config = difficulties[this.difficulty];

    // 生成胶囊
    this.capsuleAccum += dt;
    while (this.capsuleAccum >= config.capsuleInterval) {
      this.spawnCapsule(config.capsuleSpeed);
      this.capsuleAccum -= config.capsuleInterval;
    }

    // 生成病毒
    this.virusAccum += dt;
    while (this.virusAccum >= config.virusInterval) {
      this.spawnVirus(config.virusSpeedMin, config.virusSpeedMax);
      this.virusAccum -= config.virusInterval;
    }

    // 更新实体
    this.updateEntities(dt);

    // 碰撞检测
    this.checkCollisions();

    // 渲染
    this.render();

    this.gameLoopRAF = requestAnimationFrame(this.gameLoop);
  };

  // ======================== 实体更新 ========================

  private handleMove(clientX: number, clientY: number): void {
    if (this.state !== 'playing') return;
    const rect = this.stage.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const { width, height } = this.renderer.getSize();
    this.ambulanceX = clamp(x, 15, width - 15);
    this.ambulanceY = clamp(y, 0, height - 64);
  }

  private spawnCapsule(speed: number): void {
    audioManager.play('shot');
    const { height } = this.renderer.getSize();
    this.capsules.push({
      x: this.ambulanceX,
      y: this.ambulanceY - 13,
      vy: -(height + 26) / speed, // 从当前位置飞到顶部外的时间 = speed ms
      active: true,
    });
  }

  private spawnVirus(speedMin: number, speedMax: number): void {
    const { width, height } = this.renderer.getSize();
    const speed = randomInt(speedMin, speedMax);
    const left = randomInt(0, width - 64);
    const targetLeft = randomInt(0, width - 64);

    this.viruses.push({
      x: left,
      y: -64,
      width: 64,
      height: 64,
      vx: (targetLeft - left) / speed,
      vy: (height + 128) / speed, // 从 -64 飞到 height+64 的时间 = speed ms
      rotation: 0,
      rotationSpeed: (Math.PI * 2) / 2000, // 2s 一圈
      active: true,
      killedAt: null,
    });
  }

  private updateEntities(dt: number): void {
    const { height } = this.renderer.getSize();
    const now = performance.now();

    // 更新胶囊
    for (const cap of this.capsules) {
      if (!cap.active) continue;
      cap.y += cap.vy * dt;
      if (cap.y < -30) cap.active = false;
    }
    this.capsules = this.capsules.filter(c => c.active);

    // 更新病毒：被击杀的显示 killed 图 500ms 后移除
    for (const v of this.viruses) {
      if (!v.active) continue;
      if (v.killedAt !== null) continue; // 被击杀的不再移动
      v.x += v.vx * dt;
      v.y += v.vy * dt;
      v.rotation += v.rotationSpeed * dt;

      // 飞出屏幕
      if (v.y > height + 64) v.active = false;
    }
    // 过滤：active=true 或者被击杀但还在显示期内
    this.viruses = this.viruses.filter(v =>
      v.active || (v.killedAt !== null && now - v.killedAt < 500)
    );

    // 更新粒子
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.0002 * dt; // 微重力
      p.life -= dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }

  // ======================== 碰撞检测 ========================

  private checkCollisions(): void {
    const ax = this.ambulanceX;
    const ay = this.ambulanceY + 32; // 救护车中心

    for (let vi = this.viruses.length - 1; vi >= 0; vi--) {
      const v = this.viruses[vi];
      if (!v.active || v.killedAt !== null) continue;

      const vx = v.x + 32; // 病毒中心
      const vy = v.y + 32;

      // 胶囊 vs 病毒
      let hit = false;
      for (let ci = this.capsules.length - 1; ci >= 0; ci--) {
        const c = this.capsules[ci];
        if (!c.active) continue;
        if (Math.abs(vx - c.x) <= 40 && Math.abs(vy - c.y) <= 45) {
          c.active = false;
          v.active = false;  // 标记为非活跃，依赖 killedAt 显示击杀图
          v.killedAt = performance.now();
          this.onVirusKilled(v);
          hit = true;
          break;
        }
      }
      if (hit) continue;

      // 病毒 vs 救护车
      if (Math.abs(vx - ax) <= 47 && Math.abs(vy - ay) <= 64) {
        v.active = false;
        this.onGameOver();
        return;
      }
    }
  }

  // ======================== 游戏事件 ========================

  private onVirusKilled(virus: VirusEntity): void {
    audioManager.play('killed');
    this.score++;

    // 生成击杀粒子
    const cx = virus.x + 32;
    const cy = virus.y + 32;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.5;
      const speed = 0.15 + Math.random() * 0.2;
      this.particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.1,
        life: 300 + Math.random() * 200,
        maxLife: 500,
        size: 3 + Math.random() * 3,
        color: ['#ff4444', '#ff8800', '#ffcc00', '#44ff44'][Math.floor(Math.random() * 4)],
      });
    }
  }

  private onGameOver(): void {
    this.state = 'over';
    this.stage.style.cursor = 'default';
    audioManager.play('gameOver');
    audioManager.fadeOutBgMusic(600);

    // 停止游戏循环
    cancelAnimationFrame(this.gameLoopRAF);

    // 清理移动监听
    if (this.moveHandler) {
      document.removeEventListener('mousemove', this.moveHandler);
      document.removeEventListener('touchmove', this.moveHandler);
      this.moveHandler = null;
    }

    // 生成爆炸粒子
    const cx = this.ambulanceX;
    const cy = this.ambulanceY + 32;
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.1 + Math.random() * 0.3;
      this.particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.15,
        life: 500 + Math.random() * 500,
        maxLife: 1000,
        size: 4 + Math.random() * 5,
        color: ['#ff0000', '#ff6600', '#ffff00', '#ffffff'][Math.floor(Math.random() * 4)],
      });
    }

    // 播放爆炸动画后显示结算
    const explosionStart = performance.now();
    const explosionLoop = (now: number) => {
      const dt = now - explosionStart;
      this.updateEntities(16);
      this.renderer.clear();
      // 不画救护车（已爆炸）
      for (const v of this.viruses) this.renderer.drawVirus(v);
      for (const c of this.capsules) this.renderer.drawCapsule(c);
      this.renderer.drawParticles(this.particles);
      if (dt < 800) {
        requestAnimationFrame(explosionLoop);
      } else {
        this.showResult();
      }
    };
    requestAnimationFrame(explosionLoop);

    // 保存分数
    this.saveScore();
  }

  // ======================== 渲染 ========================

  private render(): void {
    this.renderer.clear();
    this.renderer.drawAmbulance(this.ambulanceX, this.ambulanceY);
    for (const c of this.capsules) this.renderer.drawCapsule(c);
    for (const v of this.viruses) this.renderer.drawVirus(v);
    this.renderer.drawParticles(this.particles);
    this.renderer.drawScore(this.score);
  }

  // ======================== 结算 ========================

  private showResult(): void {
    this.canvas.style.display = 'none';
    Array.from(this.stage.children).forEach(ch => { if (ch !== this.canvas) ch.remove(); });

    const scoreText = String(this.score * 1000);
    const digitCount = String(this.score).length;

    let alertClass: string;
    let message: string;
    if (digitCount <= 1) {
      alertClass = 'alert-danger';
      message = '不要气馁，继续努力!';
    } else if (digitCount === 2) {
      alertClass = 'alert-warning';
      message = '坚持就是胜利!';
    } else if (digitCount === 3) {
      alertClass = 'alert-info';
      message = '离消灭病毒只剩一点点了!';
    } else {
      alertClass = 'alert-success';
      message = '病毒已经消灭，感谢您为消灭病毒做出的努力!';
    }

    const result = document.createElement('div');
    result.className = 'result-overlay';
    result.innerHTML = `
      <div class="result-card ${alertClass}">
        <div class="result-score-label">您获得了</div>
        <div class="result-score">${scoreText}</div>
        <div class="result-score-unit">分</div>
        <div class="result-message">${message}</div>
        <button class="btn btn-lg btn-primary result-restart-btn">继续消灭</button>
      </div>
    `;
    this.stage.appendChild(result);

    result.querySelector('.result-restart-btn')!.addEventListener('click', () => this.restart());

    // 弹出防疫知识
    setTimeout(() => {
      this.showModal('悄悄告诉你：', data.knowledge[randomInt(0, data.knowledge.length)]);
    }, 500);
  }

  private saveScore(): void {
    const key = `civilwar_scores_${this.difficulty}`;
    const raw = localStorage.getItem(key);
    const scores: { score: number; date: string }[] = raw ? JSON.parse(raw) : [];
    scores.push({ score: this.score * 1000, date: new Date().toISOString() });
    scores.sort((a, b) => b.score - a.score);
    if (scores.length > 10) scores.length = 10;
    localStorage.setItem(key, JSON.stringify(scores));
  }

  getLeaderboard(difficulty?: DifficultyName): { score: number; date: string }[] {
    const key = `civilwar_scores_${difficulty ?? this.difficulty}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  private restart(): void {
    this.hideModal();
    this.score = 0;
    this.capsules = [];
    this.viruses = [];
    this.particles = [];
    if (this.timers.ready) clearInterval(this.timers.ready);
    Array.from(this.stage.children).forEach(ch => { if (ch !== this.canvas) ch.remove(); });
    this.drawMenu();
  }
}
