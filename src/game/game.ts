import type { GameState, GameTimers, DifficultyName } from './types';
import { difficulties, images, data, audio as audioSrc } from './config';
import { audioManager } from './audio';
import { randomInt, clamp } from './utils';
import BootstrapModal from 'bootstrap/js/dist/modal';
const Modal = (BootstrapModal as any).default || BootstrapModal;

/** 存活中的病毒列表，用于全局碰撞检测 */
const activeViruses = new Set<HTMLElement>();

/** 全局碰撞检测帧（单 rAF 驱动） */
let collisionRunning = false;
function runCollisionLoop(stage: HTMLElement, onHit: (virus: HTMLElement) => void, onCollide: (virus: HTMLElement, ambulance: HTMLElement) => void): void {
  if (collisionRunning) return;
  collisionRunning = true;

  const loop = () => {
    if (!collisionRunning) return;
    for (const virus of activeViruses) {
      if (!virus.isConnected) { activeViruses.delete(virus); continue; }
      const vx = virus.offsetLeft + 32;
      const vy = virus.offsetTop + 32;

      // 胶囊 vs 病毒
      const capsules = stage.querySelectorAll('.capsule');
      let hit = false;
      for (const cap of capsules) {
        const cx = cap.offsetLeft + 8;
        const cy = cap.offsetTop + 13;
        if (Math.abs(vx - cx) <= 40 && Math.abs(vy - cy) <= 45) {
          activeViruses.delete(virus);
          onHit(virus);
          hit = true;
          break;
        }
      }
      if (hit) continue;

      // 病毒 vs 救护车
      const ambulance = stage.querySelector('.ambulance') as HTMLElement | null;
      if (!ambulance || stage.querySelector('.tips')) continue;
      const ax = ambulance.offsetLeft + 15;
      const ay = ambulance.offsetTop + 32;
      if (Math.abs(vx - ax) <= 47 && Math.abs(vy - ay) <= 64) {
        activeViruses.delete(virus);
        onCollide(virus, ambulance);
        collisionRunning = false;
        return;
      }
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/** 游戏主类 */
export class Game {
  private stage: HTMLElement;
  private state: GameState = 'menu';
  private difficulty: DifficultyName = 'normal';
  private score = 0;
  private ambulanceX = 0;
  private ambulanceY = 0;
  private timers: GameTimers = {
    capsule: null,
    virus: null,
    backgroundMusic: null,
    startGame: null,
  };
  private moveHandler: ((e: Event) => void) | null = null;

  constructor(stageId: string) {
    this.stage = document.getElementById(stageId)!;
    audioManager.init(audioSrc);
  }

  /** 启动 —— 绘制开始画面 */
  start(): void {
    this.drawMenu();
  }

  /** 绘制开始菜单 */
  private drawMenu(): void {
    // Logo
    const title = document.createElement('div');
    title.className = 'title';
    const logoDiv = document.createElement('div');
    logoDiv.className = 'logo';
    const logoImg = document.createElement('img');
    logoImg.alt = '全民战疫';
    logoImg.src = images.logo;
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
        <button type="button" class="btn btn-outline-light diff-btn active" data-diff="easy">简单</button>
        <button type="button" class="btn btn-outline-light diff-btn active-selected" data-diff="normal">普通</button>
        <button type="button" class="btn btn-outline-light diff-btn" data-diff="hard">困难</button>
      </div>
    `;
    this.stage.appendChild(diffGroup);

    // 难度按钮事件
    diffGroup.querySelectorAll('.diff-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        diffGroup.querySelectorAll('.diff-btn').forEach((b) => {
          b.classList.remove('active-selected');
          b.classList.add('active');
        });
        btn.classList.remove('active');
        btn.classList.add('active-selected');
        this.difficulty = (btn as HTMLElement).dataset.diff! as DifficultyName;
      });
    });

    // 按钮组
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'buttonGroup col-8';
    buttonGroup.innerHTML = `
      <a class="btn btn-block btn-lg btn-success" href="javascript:;">开始游戏</a>
      <a class="btn btn-block btn-lg btn-primary" href="javascript:;" data-bs-toggle="modal" data-bs-target="#modal">查看规则</a>
      <a class="btn btn-block btn-lg btn-warning" href="javascript:;" data-bs-toggle="modal" data-bs-target="#modal">防疫小知识</a>
      <a class="btn btn-block btn-lg btn-danger" href="javascript:;" data-bs-toggle="modal" data-bs-target="#modal">谣言我先知</a>
    `;
    this.stage.appendChild(buttonGroup);

    buttonGroup.querySelectorAll('a').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        this.onMenuClick(index);
      });
    });
  }

  /** 菜单按钮点击 */
  private onMenuClick(index: number): void {
    const showMessage = document.getElementById('showMessage')!;
    const modalTitle = document.querySelector<HTMLElement>('.modal-title')!;

    switch (index) {
      case 0:
        this.beginGame();
        break;
      case 1:
        modalTitle.textContent = '游戏规则';
        showMessage.innerHTML = data.rules.join('\n');
        break;
      case 2:
        modalTitle.textContent = '防疫小知识';
        showMessage.innerHTML = `<li class="list-group-item list-group-item-success">
          ${data.knowledge[randomInt(0, data.knowledge.length)]}
        </li>`;
        break;
      case 3: {
        const [rumor, truth] = data.rumors[randomInt(0, data.rumors.length)];
        modalTitle.textContent = '谣言我先知';
        showMessage.innerHTML = `<li class="list-group-item list-group-item-danger">${rumor}</li>
          <li class="list-group-item list-group-item-success">${truth}</li>`;
        break;
      }
    }
  }

  /** 开始游戏 */
  private beginGame(): void {
    this.state = 'ready';
    this.stage.style.cursor = 'none';
    this.removeMenuElements();

    // Ready -> GO 动画
    const ready = document.createElement('div');
    ready.id = 'ready';
    ready.textContent = 'Ready';
    ready.style.fontSize = '1em';
    this.stage.appendChild(ready);

    let size = 1;
    const growInterval = setInterval(() => {
      size += 0.05;
      ready.style.fontSize = `${size}em`;
      if (size >= 5) {
        clearInterval(growInterval);
        ready.textContent = 'GO!';
        ready.style.transition = 'opacity 1s';
        ready.style.opacity = '0';
        setTimeout(() => ready.remove(), 1000);
      }
    }, 20);

    audioManager.play('button');
    audioManager.play('start');
    audioManager.setVolume('shot', 0.4);

    // 延迟播放背景音乐
    this.timers.backgroundMusic = setTimeout(() => {
      audioManager.play('bgMusic');
    }, 2000);

    // 注册移动控制
    if (/Android|webOS|iPhone|iPad|BlackBerry/i.test(navigator.userAgent)) {
      this.moveHandler = (e: Event) => {
        e.preventDefault();
        const touch = (e as TouchEvent).changedTouches[0];
        this.handleMove(touch.clientX, touch.clientY);
      };
      document.addEventListener('touchmove', this.moveHandler, { passive: false });
    } else {
      this.moveHandler = (e: Event) => {
        const mouse = e as MouseEvent;
        this.handleMove(mouse.clientX, mouse.clientY);
      };
      document.addEventListener('mousemove', this.moveHandler);
    }

    // 延迟开始游戏逻辑
    const config = difficulties[this.difficulty];
    this.timers.startGame = setTimeout(() => {
      this.state = 'playing';
      this.drawGameElements();
      activeViruses.clear();
      collisionRunning = false;

      // 启动全局碰撞循环
      runCollisionLoop(
        this.stage,
        (virus) => this.onVirusKilled(virus),
        (virus, ambulance) => this.onGameOver(virus, ambulance),
      );

      this.timers.capsule = setInterval(() => {
        this.spawnCapsule(config.capsuleSpeed);
      }, config.capsuleInterval);

      this.timers.virus = setInterval(() => {
        this.spawnVirus(
          randomInt(config.virusSpeedMin, config.virusSpeedMax),
          randomInt(0, this.stage.clientWidth - 64),
          -randomInt(32, 64),
        );
      }, config.virusInterval);
    }, 2000);
  }

  /** 处理鼠标/触摸移动 */
  private handleMove(clientX: number, clientY: number): void {
    if (this.state !== 'playing') return;
    const rect = this.stage.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    this.moveAmbulance(x, y);
  }

  /** 绘制游戏元素（救护车、分数） */
  private drawGameElements(): void {
    // 救护车
    const ambulance = document.createElement('div');
    ambulance.className = 'ambulance';
    ambulance.style.backgroundImage = `url(${images.ambulance})`;
    const initLeft = this.stage.clientWidth / 2 - 15;
    const initTop = this.stage.clientHeight / 2 + 64;
    ambulance.style.left = `${initLeft}px`;
    ambulance.style.top = `${initTop}px`;
    this.stage.appendChild(ambulance);

    this.ambulanceX = initLeft + ambulance.offsetWidth / 2;
    this.ambulanceY = initTop;

    // 分数
    const scoreEl = document.createElement('div');
    scoreEl.className = 'score';
    scoreEl.textContent = '0';
    this.stage.appendChild(scoreEl);
  }

  /** 移动救护车 */
  private moveAmbulance(x: number, y: number): void {
    const ambulance = this.stage.querySelector('.ambulance') as HTMLElement | null;
    if (!ambulance) return;

    const w = ambulance.offsetWidth;
    const h = ambulance.offsetHeight;
    const left = clamp(x - w / 2, 0, this.stage.clientWidth - w);
    const top = clamp(y - h / 2, 0, this.stage.clientHeight - h);

    ambulance.style.left = `${left}px`;
    ambulance.style.top = `${top}px`;
    this.ambulanceX = left + w / 2;
    this.ambulanceY = top;
  }

  /** 发射胶囊 */
  private spawnCapsule(speed: number): void {
    audioManager.play('shot');
    const capsule = document.createElement('div');
    capsule.className = 'capsule';
    capsule.style.backgroundImage = `url(${images.capsule})`;
    capsule.style.left = `${this.ambulanceX - 7}px`;
    capsule.style.top = `${this.ambulanceY - 13}px`;
    this.stage.appendChild(capsule);

    const targetTop = -26;
    const startTime = performance.now();
    const startTop = this.ambulanceY - 13;
    const duration = speed;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      capsule.style.top = `${startTop + (targetTop - startTop) * progress}px`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        capsule.remove();
      }
    };
    requestAnimationFrame(animate);
  }

  /** 生成病毒 */
  private spawnVirus(speed: number, left: number, top: number): void {
    const virus = document.createElement('div');
    virus.className = 'virus';
    virus.style.backgroundImage = `url(${images.virus})`;
    virus.style.left = `${left}px`;
    virus.style.top = `${top}px`;
    this.stage.appendChild(virus);
    activeViruses.add(virus);

    const targetTop = this.stage.clientHeight + 64;
    const driftLeft = randomInt(0, this.stage.clientWidth);
    const startTime = performance.now();
    const duration = speed;

    // 动画
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      virus.style.top = `${top + (targetTop - top) * progress}px`;
      virus.style.left = `${left + (driftLeft - left) * progress}px`;

      if (progress < 1 && virus.isConnected) {
        requestAnimationFrame(animate);
      } else {
        activeViruses.delete(virus);
        virus.remove();
      }
    };
    requestAnimationFrame(animate);
  }

  /** 病毒被消灭 */
  private onVirusKilled(virus: HTMLElement): void {
    if (this.state !== 'playing') return;
    virus.style.backgroundImage = `url(${images.killed})`;
    audioManager.play('killed');
    // 找到命中病毒的胶囊并删除
    const vx = virus.offsetLeft + 32;
    const vy = virus.offsetTop + 32;
    const capsules = this.stage.querySelectorAll('.capsule');
    for (const cap of capsules) {
      const cx = cap.offsetLeft + 8;
      const cy = cap.offsetTop + 13;
      if (Math.abs(vx - cx) <= 40 && Math.abs(vy - cy) <= 45) {
        cap.remove();
        break;
      }
    }
    this.score++;
    const scoreEl = this.stage.querySelector('.score');
    if (scoreEl) scoreEl.textContent = String(this.score * 1000);
    setTimeout(() => virus.remove(), 300);
  }

  /** 碰撞检测（已由全局循环接管） */

  /** 游戏结束 */
  private onGameOver(virus: HTMLElement, ambulance: HTMLElement): void {
    this.state = 'over';
    this.stage.style.cursor = 'default';
    audioManager.play('gameOver');
    audioManager.pause('bgMusic');

    // 清理碰撞循环
    collisionRunning = false;
    activeViruses.clear();
    if (this.timers.capsule) clearInterval(this.timers.capsule);
    if (this.timers.virus) clearInterval(this.timers.virus);
    if (this.moveHandler) {
      document.removeEventListener('mousemove', this.moveHandler);
      document.removeEventListener('touchmove', this.moveHandler);
    }

    // 爆炸效果
    virus.remove();
    ambulance.style.backgroundImage = `url(${images.isDestroy})`;
    const scoreEl = this.stage.querySelector('.score');
    if (scoreEl) scoreEl.classList.add('none');
    setTimeout(() => ambulance.remove(), 400);

    // 保存分数
    this.saveScore();

    // 结算面板
    const tips = this.createResultPanel();
    this.stage.appendChild(tips);

    // 同时弹出知识
    setTimeout(() => {
      const modalTitle = document.querySelector<HTMLElement>('.modal-title')!;
      const showMessage = document.getElementById('showMessage')!;
      modalTitle.textContent = '悄悄告诉你：';
      showMessage.innerHTML = `<li class="list-group-item list-group-item-success">
        ${data.knowledge[randomInt(0, data.knowledge.length)]}
      </li>`;
      const modal = new Modal(document.getElementById('modal')!);
      modal.show();
    }, 500);

    setTimeout(() => {
      tips.style.display = 'block';
    }, 1000);
  }

  /** 创建结算面板 */
  private createResultPanel(): HTMLElement {
    const scoreText = String(this.score * 1000);
    const tips = document.createElement('div');
    tips.className = 'tips alert';
    tips.style.display = 'none';

    const digitCount = String(this.score).length;
    let level: 0 | 1 | 2 | 3;
    let alertClass: string;
    let message: string;

    if (digitCount <= 1) {
      level = 0;
      alertClass = 'alert-danger';
      message = '不要气馁，继续努力!';
    } else if (digitCount === 2) {
      level = 1;
      alertClass = 'alert-warning';
      message = '坚持就是胜利!';
    } else if (digitCount === 3) {
      level = 2;
      alertClass = 'alert-info';
      message = '离消灭病毒只剩一点点了!';
    } else {
      level = 3;
      alertClass = 'alert-success';
      message = '病毒已经消灭，感谢您为消灭病毒做出的努力!';
    }

    tips.classList.add(alertClass);
    tips.innerHTML = `
      您获得了<span class="s">${scoreText}</span>分<br />
      ${message}<br />
      <p class="btn btn-block btn-lg btn-primary">继续消灭</p>
    `;

    // "继续消灭" 按钮
    tips.querySelector('p')!.addEventListener('click', () => {
      this.restart();
    });

    return tips;
  }

  /** 保存分数到 localStorage */
  private saveScore(): void {
    const key = `civilwar_scores_${this.difficulty}`;
    const raw = localStorage.getItem(key);
    const scores: { score: number; date: string }[] = raw ? JSON.parse(raw) : [];
    scores.push({ score: this.score * 1000, date: new Date().toISOString() });
    // 只保留前 10 名
    scores.sort((a, b) => b.score - a.score);
    if (scores.length > 10) scores.length = 10;
    localStorage.setItem(key, JSON.stringify(scores));
  }

  /** 获取排行榜 */
  getLeaderboard(difficulty?: DifficultyName): { score: number; date: string }[] {
    const key = `civilwar_scores_${difficulty ?? this.difficulty}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  /** 重新开始 */
  private restart(): void {
    this.score = 0;
    collisionRunning = false;
    activeViruses.clear();
    this.removeMenuElements();
    this.drawMenu();
  }

  /** 移除所有游戏 UI 元素 */
  private removeMenuElements(): void {
    this.stage.innerHTML = '';
  }
}
