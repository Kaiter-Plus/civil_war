import type {
  GameState,
  GameTimers,
  DifficultyName,
  CapsuleEntity,
  VirusEntity,
  Particle,
  ScorePopup
} from "./types"
import { difficulties, data, audio as audioSrc, images as imageSrcs } from "./config"
import { audioManager } from "./audio"
import { randomInt, clamp, isMobile } from "./utils"
import { Renderer } from "./renderer"

/** 对象池：复用实体对象减少 GC */
class ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  private reset: (obj: T) => void

  constructor(factory: () => T, reset: (obj: T) => void, initialSize = 0) {
    this.factory = factory
    this.reset = reset
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory())
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      const obj = this.pool.pop()!
      this.reset(obj)
      return obj
    }
    return this.factory()
  }

  release(obj: T): void {
    if (this.pool.length < 100) {
      this.pool.push(obj)
    }
  }
}

/** 游戏主类 */
export class Game {
  private stage: HTMLElement
  private renderer: Renderer
  private canvas: HTMLCanvasElement
  private state: GameState = "menu"
  private difficulty: DifficultyName = "normal"
  private score = 0

  // 连杀系统
  private combo = 0
  private maxCombo = 0
  private lastKillTime = 0
  private comboTimeout = 1500 // 1.5s 内不击杀则连杀断

  // 动态难度
  private currentLevel = 1
  private currentInterval: number
  private currentSpeedMin: number
  private currentSpeedMax: number

  // 救护车位置（中心X, 顶部Y）
  private ambulanceX = 0
  private ambulanceY = 0

  // 实体数组
  private capsules: CapsuleEntity[] = []
  private viruses: VirusEntity[] = []
  private particles: Particle[] = []
  private scorePopups: ScorePopup[] = []

  // 对象池
  private particlePool: ObjectPool<Particle>
  private popupPool: ObjectPool<ScorePopup>

  // 游戏循环
  private gameLoopRAF = 0
  private lastTime = 0
  private capsuleAccum = 0
  private virusAccum = 0

  // 菜单阶段定时器
  private timers: GameTimers = {
    ready: null,
    backgroundMusic: null
  }

  private moveHandler: ((e: Event) => void) | null = null
  private modalEl: HTMLElement | null = null

  constructor(stageId: string) {
    this.stage = document.getElementById(stageId)!

    // 创建 Canvas
    this.canvas = document.createElement("canvas")
    this.canvas.style.position = "absolute"
    this.canvas.style.top = "0"
    this.canvas.style.left = "0"
    this.canvas.style.zIndex = "1"
    this.stage.appendChild(this.canvas)

    this.renderer = new Renderer(this.canvas)

    // 初始化动态难度参数
    const cfg = difficulties[this.difficulty]
    this.currentInterval = cfg.virusInterval
    this.currentSpeedMin = cfg.virusSpeedMin
    this.currentSpeedMax = cfg.virusSpeedMax

    // 对象池
    this.particlePool = new ObjectPool<Particle>(
      () => ({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 500,
        size: 3,
        color: "#fff"
      }),
      () => {},
      50
    )
    this.popupPool = new ObjectPool<ScorePopup>(
      () => ({ x: 0, y: 0, text: "", color: "#fff", life: 0, maxLife: 800 }),
      () => {},
      10
    )

    // 加载音频
    audioManager.init(audioSrc)
  }

  /** 启动 — 预加载资源后绘制菜单 */
  async start(): Promise<void> {
    await this.renderer.loadImages(imageSrcs as any)
    this.drawMenu()
  }

  // ======================== 菜单 ========================

  private drawMenu(): void {
    this.canvas.style.display = "none"

    // Logo
    const title = document.createElement("div")
    title.className = "title"
    const logoDiv = document.createElement("div")
    logoDiv.className = "logo"
    const logoImg = document.createElement("img")
    logoImg.alt = "全民战疫"
    logoImg.src = imageSrcs.logo
    logoImg.className = "img-fluid"
    logoImg.style.userSelect = "none"
    logoDiv.appendChild(logoImg)
    title.appendChild(logoDiv)
    this.stage.appendChild(title)

    // 难度选择
    const diffGroup = document.createElement("div")
    diffGroup.className = "difficultyGroup col-8 mb-3"
    diffGroup.innerHTML = `
      <div class="btn-group w-100" role="group">
        <button type="button" class="btn diff-btn" data-diff="easy">简单</button>
        <button type="button" class="btn diff-btn active-selected" data-diff="normal">普通</button>
        <button type="button" class="btn diff-btn" data-diff="hard">困难</button>
      </div>`
    this.stage.appendChild(diffGroup)

    diffGroup.querySelectorAll(".diff-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        diffGroup.querySelectorAll(".diff-btn").forEach(b => b.classList.remove("active-selected"))
        btn.classList.add("active-selected")
        this.difficulty = (btn as HTMLElement).dataset.diff! as DifficultyName
      })
    })

    // 按钮组
    const buttonGroup = document.createElement("div")
    buttonGroup.className = "buttonGroup col-8"
    buttonGroup.innerHTML = `
      <a class="btn btn-block btn-lg btn-success" href="javascript:;">开始游戏</a>
      <a class="btn btn-block btn-lg btn-primary" href="javascript:;">查看规则</a>
      <a class="btn btn-block btn-lg btn-warning" href="javascript:;">防疫小知识</a>
      <a class="btn btn-block btn-lg btn-danger" href="javascript:;">谣言我先知</a>
      <a class="btn btn-block btn-lg btn-leaderboard" href="javascript:;">排行榜</a>`
    this.stage.appendChild(buttonGroup)

    buttonGroup.querySelectorAll("a").forEach((btn, index) => {
      btn.addEventListener("click", () => this.onMenuClick(index))
    })
  }

  private onMenuClick(index: number): void {
    switch (index) {
      case 0:
        this.beginGame()
        break
      case 1:
        this.showModal("游戏规则", data.rules.join("\n"))
        break
      case 2:
        this.showModal("防疫小知识", data.knowledge[randomInt(0, data.knowledge.length)])
        break
      case 3: {
        const [rumor, truth] = data.rumors[randomInt(0, data.rumors.length)]
        this.showModal(
          "谣言我先知",
          `<div class="rumor">${rumor}</div><div class="truth">${truth}</div>`
        )
        break
      }
      case 4:
        this.showLeaderboard()
        break
    }
  }

  // ======================== 排行榜 ========================

  private showLeaderboard(): void {
    let html = '<div class="leaderboard-tabs">'
    for (const diff of ["easy", "normal", "hard"] as DifficultyName[]) {
      const label = difficulties[diff].label
      const scores = this.getLeaderboard(diff)
      html += `<div class="lb-section">
        <div class="lb-title">${label}</div>`
      if (scores.length === 0) {
        html += '<div class="lb-empty">暂无记录</div>'
      } else {
        html += '<div class="lb-list">'
        for (let i = 0; i < scores.length; i++) {
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`
          const date = new Date(scores[i].date).toLocaleDateString("zh-CN")
          html += `<div class="lb-row"><span class="lb-rank">${medal}</span><span class="lb-score">${scores[i].score}</span><span class="lb-date">${date}</span></div>`
        }
        html += "</div>"
      }
      html += "</div>"
    }
    html += "</div>"
    this.showModal("排行榜", html)
  }

  // ======================== 自定义 Modal ========================

  private showModal(title: string, content: string): void {
    this.hideModal()
    const modal = document.createElement("div")
    modal.className = "game-modal-overlay"
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
    `
    document.body.appendChild(modal)
    this.modalEl = modal

    modal.querySelector(".game-modal-close")!.addEventListener("click", () => this.hideModal())
    modal.querySelector(".btn-success")!.addEventListener("click", () => this.hideModal())
    modal.addEventListener("click", e => {
      if (e.target === modal) this.hideModal()
    })
  }

  private hideModal(): void {
    if (this.modalEl) {
      this.modalEl.remove()
      this.modalEl = null
    }
  }

  // ======================== 游戏流程 ========================

  private beginGame(): void {
    this.hideModal()
    this.state = "ready"
    this.stage.style.cursor = "none"

    // 清除菜单 DOM（保留 canvas）
    Array.from(this.stage.children).forEach(child => {
      if (child !== this.canvas) child.remove()
    })
    this.canvas.style.display = "block"
    this.renderer.resize()

    const { width, height } = this.renderer.getSize()

    // 重置状态
    this.score = 0
    this.capsules = []
    this.viruses = []
    this.particles = []
    this.scorePopups = []
    this.combo = 0
    this.maxCombo = 0
    this.lastKillTime = 0
    this.currentLevel = 1
    this.capsuleAccum = 0
    this.virusAccum = 0

    // 重置动态难度
    const cfg = difficulties[this.difficulty]
    this.currentInterval = cfg.virusInterval
    this.currentSpeedMin = cfg.virusSpeedMin
    this.currentSpeedMax = cfg.virusSpeedMax

    // 初始救护车位置
    this.ambulanceX = width / 2
    this.ambulanceY = height / 2 + 64

    // Ready -> GO 动画（用 canvas 绘制）
    audioManager.play("button")
    audioManager.play("start")

    this.timers.backgroundMusic = setTimeout(() => audioManager.fadeInBgMusic(2000), 1500)

    let readyPhase = "ready"
    let fontSize = 16
    this.timers.ready = setInterval(() => {
      this.renderer.clear()
      if (readyPhase === "ready") {
        fontSize += 1.5
        this.renderer.drawReadyText("Ready", fontSize)
        if (fontSize >= 80) readyPhase = "go"
      } else {
        this.renderer.drawReadyText("GO!", 80)
        fontSize += 2
        if (fontSize >= 140) {
          clearInterval(this.timers.ready!)
          this.startPlaying()
        }
      }
    }, 16)

    // 注册移动控制
    if (isMobile()) {
      this.moveHandler = (e: Event) => {
        e.preventDefault()
        const touch = (e as TouchEvent).changedTouches[0]
        this.handleMove(touch.clientX, touch.clientY)
      }
      document.addEventListener("touchmove", this.moveHandler, {
        passive: false
      })
    } else {
      this.moveHandler = (e: Event) =>
        this.handleMove((e as MouseEvent).clientX, (e as MouseEvent).clientY)
      document.addEventListener("mousemove", this.moveHandler)
    }
  }

  private startPlaying(): void {
    this.state = "playing"
    this.lastTime = performance.now()
    this.gameLoopRAF = requestAnimationFrame(this.gameLoop)
  }

  // ======================== 游戏主循环 ========================

  private gameLoop = (now: number): void => {
    if (this.state !== "playing") return

    const dt = Math.min(now - this.lastTime, 50)
    this.lastTime = now

    const config = difficulties[this.difficulty]

    // 生成胶囊
    this.capsuleAccum += dt
    while (this.capsuleAccum >= config.capsuleInterval) {
      this.spawnCapsule(config.capsuleSpeed)
      this.capsuleAccum -= config.capsuleInterval
    }

    // 生成病毒
    this.virusAccum += dt
    while (this.virusAccum >= this.currentInterval) {
      this.spawnVirus(this.currentSpeedMin, this.currentSpeedMax)
      this.virusAccum -= this.currentInterval
    }

    // 更新实体
    this.updateEntities(dt, now)

    // 碰撞检测
    this.checkCollisions(now)

    // 渲染
    this.render(now)

    this.gameLoopRAF = requestAnimationFrame(this.gameLoop)
  }

  // ======================== 实体更新 ========================

  private handleMove(clientX: number, clientY: number): void {
    if (this.state !== "playing") return
    const rect = this.stage.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    const { width, height } = this.renderer.getSize()
    this.ambulanceX = clamp(x, 15, width - 15)
    this.ambulanceY = clamp(y, 0, height - 64)
  }

  private spawnCapsule(speed: number): void {
    audioManager.play("shot")
    const { height } = this.renderer.getSize()
    this.capsules.push({
      x: this.ambulanceX,
      y: this.ambulanceY - 13,
      vy: -(height + 26) / speed,
      active: true
    })
  }

  private spawnVirus(speedMin: number, speedMax: number): void {
    const { width, height } = this.renderer.getSize()
    const speed = randomInt(speedMin, speedMax)
    const left = randomInt(0, width - 64)
    const targetLeft = randomInt(0, width - 64)

    this.viruses.push({
      x: left,
      y: -64,
      width: 64,
      height: 64,
      vx: (targetLeft - left) / speed,
      vy: (height + 128) / speed,
      rotation: 0,
      rotationSpeed: (Math.PI * 2) / 2000,
      active: true,
      killedAt: null
    })
  }

  private updateEntities(dt: number, now: number): void {
    const { height } = this.renderer.getSize()

    // 连杀超时检测
    if (this.combo > 0 && now - this.lastKillTime > this.comboTimeout) {
      this.combo = 0
    }

    // 更新胶囊
    for (const cap of this.capsules) {
      if (!cap.active) continue
      cap.y += cap.vy * dt
      if (cap.y < -30) cap.active = false
    }
    this.capsules = this.capsules.filter(c => c.active)

    // 更新病毒
    for (const v of this.viruses) {
      if (!v.active) continue
      if (v.killedAt !== null) continue
      v.x += v.vx * dt
      v.y += v.vy * dt
      v.rotation += v.rotationSpeed * dt
      if (v.y > height + 64) v.active = false
    }
    this.viruses = this.viruses.filter(
      v => v.active || (v.killedAt !== null && now - v.killedAt < 500)
    )

    // 更新粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 0.0002 * dt
      p.life -= dt
      if (p.life <= 0) {
        this.particlePool.release(this.particles[i])
        this.particles[i] = this.particles[this.particles.length - 1]
        this.particles.pop()
      }
    }

    // 更新分数飘字
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const sp = this.scorePopups[i]
      sp.life -= dt
      if (sp.life <= 0) {
        this.popupPool.release(this.scorePopups[i])
        this.scorePopups[i] = this.scorePopups[this.scorePopups.length - 1]
        this.scorePopups.pop()
      }
    }
  }

  // ======================== 碰撞检测 ========================

  private checkCollisions(now: number): void {
    const ax = this.ambulanceX
    const ay = this.ambulanceY + 32

    for (let vi = this.viruses.length - 1; vi >= 0; vi--) {
      const v = this.viruses[vi]
      if (!v.active || v.killedAt !== null) continue

      const vx = v.x + 32
      const vy = v.y + 32

      // 胶囊 vs 病毒
      let hit = false
      for (let ci = this.capsules.length - 1; ci >= 0; ci--) {
        const c = this.capsules[ci]
        if (!c.active) continue
        if (Math.abs(vx - c.x) <= 40 && Math.abs(vy - c.y) <= 45) {
          c.active = false
          v.active = false
          v.killedAt = now
          this.onVirusKilled(v, now)
          hit = true
          break
        }
      }
      if (hit) continue

      // 病毒 vs 救护车
      if (Math.abs(vx - ax) <= 47 && Math.abs(vy - ay) <= 64) {
        v.active = false
        this.onGameOver()
        return
      }
    }
  }

  // ======================== 游戏事件 ========================

  private onVirusKilled(virus: VirusEntity, now: number): void {
    audioManager.play("killed")
    this.score++

    // 连杀系统
    this.combo++
    if (this.combo > this.maxCombo) this.maxCombo = this.combo
    this.lastKillTime = now

    // 连杀奖励分
    let bonusText = ""
    let bonusColor = "#ffffff"
    if (this.combo >= 3) {
      const multiplier = 1 + Math.floor(this.combo / 3) * 0.5
      this.score += Math.floor(multiplier) - 1 // 连杀额外加分
      bonusText = ` x${multiplier.toFixed(1)}`
      bonusColor = this.combo >= 10 ? "#ff00ff" : this.combo >= 5 ? "#ff4444" : "#ffcc00"
    }

    // 分数飘字
    const popup = this.popupPool.acquire()
    popup.x = virus.x + 32
    popup.y = virus.y + 20
    popup.text = `+${1000}${bonusText}`
    popup.color = bonusColor
    popup.life = 800
    popup.maxLife = 800
    this.scorePopups.push(popup)

    // 击杀粒子
    const cx = virus.x + 32
    const cy = virus.y + 32
    const particleCount = Math.min(8 + this.combo, 20)
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5
      const speed = 0.15 + Math.random() * 0.2
      const p = this.particlePool.acquire()
      p.x = cx
      p.y = cy
      p.vx = Math.cos(angle) * speed
      p.vy = Math.sin(angle) * speed - 0.1
      p.life = 300 + Math.random() * 200
      p.maxLife = 500
      p.size = 3 + Math.random() * 3
      p.color = ["#ff4444", "#ff8800", "#ffcc00", "#44ff44"][Math.floor(Math.random() * 4)]
      this.particles.push(p)
    }

    // 动态难度升级
    this.checkDifficultyUpgrade()
  }

  /** 检查是否需要提升难度 */
  private checkDifficultyUpgrade(): void {
    const cfg = difficulties[this.difficulty]
    const newLevel = 1 + Math.floor(this.score / cfg.accelEvery)
    if (newLevel > this.currentLevel) {
      this.currentLevel = newLevel
      const steps = newLevel - 1
      this.currentInterval = Math.max(
        cfg.intervalFloor,
        cfg.virusInterval - cfg.accelInterval * steps
      )
      this.currentSpeedMin = Math.max(500, cfg.virusSpeedMin - cfg.accelSpeedMin * steps)
      this.currentSpeedMax = Math.max(1000, cfg.virusSpeedMax - cfg.accelSpeedMax * steps)
    }
  }

  private onGameOver(): void {
    this.state = "over"
    this.stage.style.cursor = "default"
    audioManager.play("gameOver")
    audioManager.fadeOutBgMusic(600)

    cancelAnimationFrame(this.gameLoopRAF)

    if (this.moveHandler) {
      document.removeEventListener("mousemove", this.moveHandler)
      document.removeEventListener("touchmove", this.moveHandler)
      this.moveHandler = null
    }

    // 爆炸粒子
    const cx = this.ambulanceX
    const cy = this.ambulanceY + 32
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.1 + Math.random() * 0.35
      const p = this.particlePool.acquire()
      p.x = cx
      p.y = cy
      p.vx = Math.cos(angle) * speed
      p.vy = Math.sin(angle) * speed - 0.15
      p.life = 500 + Math.random() * 500
      p.maxLife = 1000
      p.size = 4 + Math.random() * 6
      p.color = ["#ff0000", "#ff6600", "#ffff00", "#ffffff"][Math.floor(Math.random() * 4)]
      this.particles.push(p)
    }

    // 播放爆炸动画后显示结算
    const explosionStart = performance.now()
    const explosionLoop = (now: number) => {
      const dt = 16
      this.updateEntities(dt, now)
      this.renderer.clear()
      this.renderer.drawBackground(now)
      for (const v of this.viruses) this.renderer.drawVirus(v)
      for (const c of this.capsules) this.renderer.drawCapsule(c)
      this.renderer.drawParticles(this.particles)
      if (now - explosionStart < 800) {
        requestAnimationFrame(explosionLoop)
      } else {
        this.showResult()
      }
    }
    requestAnimationFrame(explosionLoop)

    this.saveScore()
  }

  // ======================== 渲染 ========================

  private render(now: number): void {
    this.renderer.clear()
    this.renderer.drawBackground(now)
    this.renderer.drawAmbulance(this.ambulanceX, this.ambulanceY, now)
    for (const c of this.capsules) this.renderer.drawCapsule(c)
    for (const v of this.viruses) this.renderer.drawVirus(v)
    this.renderer.drawParticles(this.particles)
    this.renderer.drawScorePopups(this.scorePopups)
    this.renderer.drawScore(this.score, this.combo, this.currentLevel)
  }

  // ======================== 结算 ========================

  private showResult(): void {
    this.canvas.style.display = "none"
    Array.from(this.stage.children).forEach(ch => {
      if (ch !== this.canvas) ch.remove()
    })

    const scoreText = String(this.score * 1000)
    const digitCount = String(this.score).length

    let alertClass: string
    let message: string
    if (digitCount <= 1) {
      alertClass = "alert-danger"
      message = "不要气馁，继续努力!"
    } else if (digitCount === 2) {
      alertClass = "alert-warning"
      message = "坚持就是胜利!"
    } else if (digitCount === 3) {
      alertClass = "alert-info"
      message = "离消灭病毒只剩一点点了!"
    } else {
      alertClass = "alert-success"
      message = "病毒已经消灭，感谢您为消灭病毒做出的努力!"
    }

    const result = document.createElement("div")
    result.className = "result-overlay"
    result.innerHTML = `
      <div class="result-card ${alertClass}">
        <div class="result-score-label">您获得了</div>
        <div class="result-score">${scoreText}</div>
        <div class="result-score-unit">分</div>
        <div class="result-message">${message}</div>
        ${this.maxCombo >= 3 ? `<div class="result-combo">最高连杀: ${this.maxCombo}</div>` : ""}
        <button class="btn btn-lg btn-primary result-restart-btn">继续消灭</button>
      </div>
    `
    this.stage.appendChild(result)

    result.querySelector(".result-restart-btn")!.addEventListener("click", () => this.restart())

    setTimeout(() => {
      this.showModal("悄悄告诉你：", data.knowledge[randomInt(0, data.knowledge.length)])
    }, 500)
  }

  private saveScore(): void {
    const key = `civilwar_scores_${this.difficulty}`
    const raw = localStorage.getItem(key)
    const scores: { score: number; date: string }[] = raw ? JSON.parse(raw) : []
    scores.push({ score: this.score * 1000, date: new Date().toISOString() })
    scores.sort((a, b) => b.score - a.score)
    if (scores.length > 10) scores.length = 10
    localStorage.setItem(key, JSON.stringify(scores))
  }

  getLeaderboard(difficulty?: DifficultyName): { score: number; date: string }[] {
    const key = `civilwar_scores_${difficulty ?? this.difficulty}`
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  }

  private restart(): void {
    this.hideModal()
    this.score = 0
    this.capsules = []
    this.viruses = []
    this.particles = []
    this.scorePopups = []
    this.combo = 0
    this.maxCombo = 0
    if (this.timers.ready) clearInterval(this.timers.ready)
    Array.from(this.stage.children).forEach(ch => {
      if (ch !== this.canvas) ch.remove()
    })
    this.drawMenu()
  }
}
