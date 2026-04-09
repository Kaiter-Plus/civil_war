import { ref, reactive, shallowRef, onUnmounted } from "vue"
import type {
  DifficultyName,
  CapsuleEntity,
  VirusEntity,
  Particle,
  ScorePopup,
  VirusMovePattern
} from "../game/types"
import {
  difficulties,
  playerUpgrade,
  virusPatternWeights,
  data,
  audio as audioSrc,
  images as imageSrcs
} from "../game/config"
import { audioManager } from "../game/audio"
import { Renderer } from "../game/renderer"
import { randomInt, clamp } from "../game/utils"

/** 根据权重随机选择移动模式 */
function pickPattern(weights: Record<VirusMovePattern, number>): VirusMovePattern {
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (const [pattern, weight] of Object.entries(weights) as [VirusMovePattern, number][]) {
    r -= weight
    if (r <= 0) return pattern
  }
  return "straight"
}

/** 对象池 */
class ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T

  constructor(factory: () => T, initialSize = 0) {
    this.factory = factory
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory())
    }
  }

  acquire(): T {
    return this.pool.pop() ?? this.factory()
  }

  release(obj: T): void {
    if (this.pool.length < 100) {
      this.pool.push(obj)
    }
  }
}

export function useGame(options: {
  onGameOver: (score: number, maxCombo: number) => void
  onReady: () => void
}) {
  const renderer = shallowRef<Renderer | null>(null)
  const canvas = shallowRef<HTMLCanvasElement | null>(null)

  // 游戏状态
  const state = ref<"menu" | "ready" | "playing" | "over">("menu")
  const difficulty = ref<DifficultyName>("normal")
  const score = ref(0)
  const combo = ref(0)
  const maxCombo = ref(0)
  const level = ref(1)

  // 实体
  const capsules = reactive<CapsuleEntity[]>([])
  const viruses = reactive<VirusEntity[]>([])
  const particles = reactive<Particle[]>([])
  const scorePopups = reactive<ScorePopup[]>([])

  // 动态难度参数（病毒）
  const currentInterval = ref(0)
  const currentSpeedMin = ref(0)
  const currentSpeedMax = ref(0)

  // 动态胶囊参数（角色加强）
  const currentCapsuleInterval = ref(0)
  const currentCapsuleSpeed = ref(0)
  const hasDoubleFire = ref(false)

  // 救护车位置
  const ambulanceX = ref(0)
  const ambulanceY = ref(0)

  // 游戏循环
  let gameLoopRAF = 0
  let lastTime = 0
  let capsuleAccum = 0
  let virusAccum = 0
  let lastKillTime = 0
  let readyTimer: ReturnType<typeof setInterval> | null = null
  let bgMusicTimer: ReturnType<typeof setTimeout> | null = null

  // 对象池
  const particlePool = new ObjectPool<Particle>(
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
    50
  )
  const popupPool = new ObjectPool<ScorePopup>(
    () => ({ x: 0, y: 0, text: "", color: "#fff", life: 0, maxLife: 800 }),
    10
  )

  // 初始化
  function init() {
    audioManager.init(audioSrc)
  }

  // 开始游戏
  async function beginGame(canvasEl: HTMLCanvasElement, diff: DifficultyName) {
    // 初始化音频（确保只初始化一次）
    init()

    canvas.value = canvasEl
    difficulty.value = diff
    state.value = "ready"

    // 初始化渲染器
    renderer.value = new Renderer(canvasEl)
    await renderer.value.loadImages(imageSrcs as Record<string, string>)
    renderer.value.resize()

    const { width, height } = renderer.value.getSize()

    // 重置状态
    score.value = 0
    combo.value = 0
    maxCombo.value = 0
    level.value = 1
    capsuleAccum = 0
    virusAccum = 0
    lastKillTime = 0
    capsules.length = 0
    viruses.length = 0
    particles.length = 0
    scorePopups.length = 0

    // 重置动态难度（病毒）
    const cfg = difficulties[diff]
    currentInterval.value = cfg.virusInterval
    currentSpeedMin.value = cfg.virusSpeedMin
    currentSpeedMax.value = cfg.virusSpeedMax

    // 重置动态胶囊参数（角色）
    currentCapsuleInterval.value = cfg.capsuleInterval
    currentCapsuleSpeed.value = cfg.capsuleSpeed
    hasDoubleFire.value = false

    // 初始救护车位置
    ambulanceX.value = width / 2
    ambulanceY.value = height / 2 + 64

    // Ready -> GO 动画
    audioManager.play("button")
    audioManager.play("start")

    bgMusicTimer = setTimeout(() => audioManager.fadeInBgMusic(2000), 1500)

    let readyPhase = "ready"
    let fontSize = 16

    readyTimer = setInterval(() => {
      if (!renderer.value) return
      renderer.value.clear()
      if (readyPhase === "ready") {
        fontSize += 1.5
        renderer.value.drawReadyText("Ready", fontSize)
        if (fontSize >= 80) readyPhase = "go"
      } else {
        renderer.value.drawReadyText("GO!", 80)
        fontSize += 2
        if (fontSize >= 140) {
          clearInterval(readyTimer!)
          options.onReady()
          startPlaying()
        }
      }
    }, 16)
  }

  function startPlaying() {
    state.value = "playing"
    lastTime = performance.now()
    gameLoopRAF = requestAnimationFrame(gameLoop)
  }

  // 游戏主循环
  function gameLoop(now: number) {
    if (state.value !== "playing" || !renderer.value) return

    const dt = Math.min(now - lastTime, 50)
    lastTime = now

    // 生成胶囊（使用动态参数）
    capsuleAccum += dt
    while (capsuleAccum >= currentCapsuleInterval.value) {
      spawnCapsule(currentCapsuleSpeed.value, hasDoubleFire.value)
      capsuleAccum -= currentCapsuleInterval.value
    }

    // 生成病毒
    virusAccum += dt
    while (virusAccum >= currentInterval.value) {
      spawnVirus(currentSpeedMin.value, currentSpeedMax.value)
      virusAccum -= currentInterval.value
    }

    // 更新实体
    updateEntities(dt, now)

    // 碰撞检测
    checkCollisions(now)

    // 渲染
    render(now)

    gameLoopRAF = requestAnimationFrame(gameLoop)
  }

  function spawnCapsule(speed: number, doubleFire: boolean = false) {
    if (!renderer.value) return
    audioManager.play("shot")
    const { height } = renderer.value.getSize()
    const vy = -(height + 26) / speed

    if (doubleFire) {
      // 双发：左右各一颗
      capsules.push(
        {
          x: ambulanceX.value - 15,
          y: ambulanceY.value - 13,
          vy,
          active: true
        },
        {
          x: ambulanceX.value + 15,
          y: ambulanceY.value - 13,
          vy,
          active: true
        }
      )
    } else {
      capsules.push({
        x: ambulanceX.value,
        y: ambulanceY.value - 13,
        vy,
        active: true
      })
    }
  }

  function spawnVirus(speedMin: number, speedMax: number) {
    if (!renderer.value) return
    const { width, height } = renderer.value.getSize()
    const now = performance.now()

    // 根据权重选择移动模式
    const pattern = pickPattern(virusPatternWeights[difficulty.value])
    const speed = randomInt(speedMin, speedMax)
    const startX = randomInt(32, width - 32)

    // 基础参数
    let vx = 0
    let vy = (height + 128) / speed
    let patternParam = 0
    let patternParam2 = 0
    let patternState = 0

    switch (pattern) {
      case "straight": {
        // 直线：带一点随机水平漂移
        const targetLeft = randomInt(0, width - 64)
        vx = (targetLeft - startX) / speed
        break
      }
      case "sine": {
        // 正弦波：振幅 40-80，周期 800-1200ms
        patternParam = randomInt(40, 80) // 振幅
        patternParam2 = randomInt(800, 1200) // 周期
        vx = 0
        break
      }
      case "zigzag": {
        // Z字形：每 400-600ms 换方向，水平速度 0.08-0.12
        patternParam = randomInt(400, 600) // 换向周期
        patternParam2 = 0.08 + Math.random() * 0.04 // 水平速度
        vx = patternParam2 * (Math.random() > 0.5 ? 1 : -1)
        patternState = 0 // 上次换向时间
        break
      }
      case "chase": {
        // 追踪：向玩家方向移动，速度降低 20%
        vy = vy * 0.8
        // vx 会在 update 中动态计算
        vx = 0
        break
      }
      case "spiral": {
        // 螺旋：边下落边水平旋转，半径 20-40，角速度 0.003-0.006
        patternParam = randomInt(20, 40) // 半径
        patternParam2 = 0.003 + Math.random() * 0.003 // 角速度
        vx = 0
        break
      }
      case "dive": {
        // 俯冲：先停在空中 600-1000ms，然后快速冲向玩家（速度 2x）
        patternParam = randomInt(600, 1000) // 停留时间
        patternParam2 = speed * 0.4 // 俯冲速度（更快）
        vy = 0 // 先停止
        vx = 0
        patternState = now // 记录生成时间
        break
      }
    }

    viruses.push({
      x: startX,
      y: -64,
      width: 64,
      height: 64,
      vx,
      vy,
      rotation: 0,
      rotationSpeed: (Math.PI * 2) / 2000,
      active: true,
      killedAt: null,
      pattern,
      patternParam,
      patternParam2,
      patternState,
      spawnTime: now,
      startX
    })
  }

  function updateEntities(dt: number, now: number) {
    if (!renderer.value) return
    const { width, height } = renderer.value.getSize()

    // 连杀超时检测
    if (combo.value > 0 && now - lastKillTime > 1500) {
      combo.value = 0
    }

    // 更新胶囊
    for (const cap of capsules) {
      if (!cap.active) continue
      cap.y += cap.vy * dt
      if (cap.y < -30) cap.active = false
    }
    // 移除无效胶囊
    for (let i = capsules.length - 1; i >= 0; i--) {
      if (!capsules[i].active) capsules.splice(i, 1)
    }

    // 更新病毒
    for (const v of viruses) {
      if (!v.active || v.killedAt !== null) continue

      // 根据移动模式计算位置
      switch (v.pattern) {
        case "straight": {
          // 直线：保持原速度
          v.x += v.vx * dt
          v.y += v.vy * dt
          break
        }
        case "sine": {
          // 正弦波：左右摆动
          const elapsed = now - v.spawnTime
          const amplitude = v.patternParam
          const period = v.patternParam2
          v.x = v.startX + Math.sin((elapsed / period) * Math.PI * 2) * amplitude
          v.y += v.vy * dt
          break
        }
        case "zigzag": {
          // Z字形：定时换向
          const elapsed = now - v.spawnTime
          const cycleTime = v.patternParam
          const halfCycle = cycleTime / 2
          const direction = Math.floor(elapsed / halfCycle) % 2 === 0 ? 1 : -1
          v.vx = v.patternParam2 * direction
          v.x += v.vx * dt
          v.y += v.vy * dt
          // 边界反弹
          if (v.x < 0) {
            v.x = 0
            v.vx = Math.abs(v.vx)
          }
          if (v.x > width - 64) {
            v.x = width - 64
            v.vx = -Math.abs(v.vx)
          }
          break
        }
        case "chase": {
          // 追踪：向玩家方向移动
          const dx = ambulanceX.value - v.x
          const dy = ambulanceY.value + 32 - v.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > 1) {
            const chaseSpeed = 0.0003 // 追踪速度系数
            v.x += (dx / dist) * chaseSpeed * dt * width
            v.y += v.vy * dt
          }
          break
        }
        case "spiral": {
          // 螺旋：水平旋转下降
          const elapsed = now - v.spawnTime
          const radius = v.patternParam
          const angularSpeed = v.patternParam2
          v.x = v.startX + Math.cos(elapsed * angularSpeed) * radius
          v.y += v.vy * dt
          // 边界限制
          v.x = clamp(v.x, 0, width - 64)
          break
        }
        case "dive": {
          // 俯冲：先停后冲
          const elapsed = now - v.spawnTime
          const waitTime = v.patternParam
          if (elapsed < waitTime) {
            // 等待阶段：缓慢下落
            v.y += 0.02 * dt
          } else if (elapsed < waitTime + 100) {
            // 过渡阶段：计算冲向玩家
            const targetX = ambulanceX.value
            const dx = targetX - v.x
            v.vx = (dx / v.patternParam2) * 0.5 // 水平速度
            v.vy = (height + 128) / v.patternParam2 // 垂直速度（快）
            v.x += v.vx * dt
            v.y += v.vy * dt
          } else {
            // 俯冲阶段
            v.x += v.vx * dt
            v.y += v.vy * dt
          }
          break
        }
      }

      v.rotation += v.rotationSpeed * dt
      if (v.y > height + 64) v.active = false
    }
    // 移除无效病毒
    for (let i = viruses.length - 1; i >= 0; i--) {
      const v = viruses[i]
      if (!v.active || (v.killedAt !== null && now - v.killedAt >= 500)) {
        viruses.splice(i, 1)
      }
    }

    // 更新粒子
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 0.0002 * dt
      p.life -= dt
      if (p.life <= 0) {
        particlePool.release(particles[i])
        particles.splice(i, 1)
      }
    }

    // 更新分数飘字
    for (let i = scorePopups.length - 1; i >= 0; i--) {
      const sp = scorePopups[i]
      sp.life -= dt
      if (sp.life <= 0) {
        popupPool.release(scorePopups[i])
        scorePopups.splice(i, 1)
      }
    }
  }

  function checkCollisions(now: number) {
    const ax = ambulanceX.value
    const ay = ambulanceY.value + 32

    for (let vi = viruses.length - 1; vi >= 0; vi--) {
      const v = viruses[vi]
      if (!v.active || v.killedAt !== null) continue

      const vx = v.x + 32
      const vy = v.y + 32

      // 胶囊 vs 病毒
      let hit = false
      for (let ci = capsules.length - 1; ci >= 0; ci--) {
        const c = capsules[ci]
        if (!c.active) continue
        if (Math.abs(vx - c.x) <= 40 && Math.abs(vy - c.y) <= 45) {
          c.active = false
          v.active = false
          v.killedAt = now
          onVirusKilled(v, now)
          hit = true
          break
        }
      }
      if (hit) continue

      // 病毒 vs 救护车
      if (Math.abs(vx - ax) <= 47 && Math.abs(vy - ay) <= 64) {
        v.active = false
        onGameOver()
        return
      }
    }
  }

  function onVirusKilled(virus: VirusEntity, now: number) {
    audioManager.play("killed")
    score.value++

    // 连杀系统
    combo.value++
    if (combo.value > maxCombo.value) maxCombo.value = combo.value
    lastKillTime = now

    // 连杀奖励分
    let bonusText = ""
    let bonusColor = "#ffffff"
    if (combo.value >= 3) {
      const multiplier = 1 + Math.floor(combo.value / 3) * 0.5
      score.value += Math.floor(multiplier) - 1
      bonusText = ` x${multiplier.toFixed(1)}`
      bonusColor = combo.value >= 10 ? "#ff00ff" : combo.value >= 5 ? "#ff4444" : "#ffcc00"
    }

    // 分数飘字
    const popup = popupPool.acquire()
    popup.x = virus.x + 32
    popup.y = virus.y + 20
    popup.text = `+${1000}${bonusText}`
    popup.color = bonusColor
    popup.life = 800
    popup.maxLife = 800
    scorePopups.push(popup)

    // 击杀粒子
    const cx = virus.x + 32
    const cy = virus.y + 32
    const particleCount = Math.min(8 + combo.value, 20)
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5
      const speed = 0.15 + Math.random() * 0.2
      const p = particlePool.acquire()
      p.x = cx
      p.y = cy
      p.vx = Math.cos(angle) * speed
      p.vy = Math.sin(angle) * speed - 0.1
      p.life = 300 + Math.random() * 200
      p.maxLife = 500
      p.size = 3 + Math.random() * 3
      p.color = ["#ff4444", "#ff8800", "#ffcc00", "#44ff44"][Math.floor(Math.random() * 4)]
      particles.push(p)
    }

    // 动态难度升级
    checkDifficultyUpgrade()
  }

  function checkDifficultyUpgrade() {
    const cfg = difficulties[difficulty.value]
    const newLevel = 1 + Math.floor(score.value / cfg.accelEvery)
    if (newLevel > level.value) {
      level.value = newLevel
      const steps = newLevel - 1

      // 病毒难度升级
      currentInterval.value = Math.max(
        cfg.intervalFloor,
        cfg.virusInterval - cfg.accelInterval * steps
      )
      currentSpeedMin.value = Math.max(500, cfg.virusSpeedMin - cfg.accelSpeedMin * steps)
      currentSpeedMax.value = Math.max(1000, cfg.virusSpeedMax - cfg.accelSpeedMax * steps)

      // 角色加强（每 levelStep 级触发）
      const upgradeSteps = Math.floor(newLevel / playerUpgrade.levelStep)
      if (upgradeSteps > 0) {
        // 射击间隔减少
        const fireRateMultiplier = Math.pow(1 - playerUpgrade.fireRateBonus, upgradeSteps)
        currentCapsuleInterval.value = Math.max(
          playerUpgrade.fireRateMin,
          cfg.capsuleInterval * fireRateMultiplier
        )
        // 飞行时间减少（速度提升）
        const speedMultiplier = Math.pow(1 - playerUpgrade.speedBonus, upgradeSteps)
        currentCapsuleSpeed.value = Math.max(
          playerUpgrade.speedMin,
          cfg.capsuleSpeed * speedMultiplier
        )
      }

      // 双发能力
      if (newLevel >= playerUpgrade.doubleFireLevel && !hasDoubleFire.value) {
        hasDoubleFire.value = true
      }
    }
  }

  function onGameOver() {
    state.value = "over"
    audioManager.play("gameOver")
    audioManager.fadeOutBgMusic(600)
    cancelAnimationFrame(gameLoopRAF)

    // 爆炸粒子
    const cx = ambulanceX.value
    const cy = ambulanceY.value + 32
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.1 + Math.random() * 0.35
      const p = particlePool.acquire()
      p.x = cx
      p.y = cy
      p.vx = Math.cos(angle) * speed
      p.vy = Math.sin(angle) * speed - 0.15
      p.life = 500 + Math.random() * 500
      p.maxLife = 1000
      p.size = 4 + Math.random() * 6
      p.color = ["#ff0000", "#ff6600", "#ffff00", "#ffffff"][Math.floor(Math.random() * 4)]
      particles.push(p)
    }

    // 播放爆炸动画后回调
    const explosionStart = performance.now()
    const explosionLoop = (now: number) => {
      if (!renderer.value) return
      const dt = 16
      updateEntities(dt, now)
      renderer.value.clear()
      renderer.value.drawBackground(now)
      for (const v of viruses) renderer.value.drawVirus(v)
      for (const c of capsules) renderer.value.drawCapsule(c)
      renderer.value.drawParticles(particles)
      if (now - explosionStart < 800) {
        requestAnimationFrame(explosionLoop)
      } else {
        saveScore()
        options.onGameOver(score.value, maxCombo.value)
      }
    }
    requestAnimationFrame(explosionLoop)
  }

  function render(now: number) {
    if (!renderer.value) return
    renderer.value.clear()
    renderer.value.drawBackground(now)
    renderer.value.drawAmbulance(ambulanceX.value, ambulanceY.value, now)
    for (const c of capsules) renderer.value.drawCapsule(c)
    for (const v of viruses) renderer.value.drawVirus(v)
    renderer.value.drawParticles(particles)
    renderer.value.drawScorePopups(scorePopups)

    // 难度名称
    const diffName =
      difficulty.value === "easy" ? "简单" : difficulty.value === "normal" ? "普通" : "困难"
    renderer.value.drawScore(score.value, combo.value, diffName, level.value, hasDoubleFire.value)
  }

  function handleMove(clientX: number, clientY: number) {
    if (state.value !== "playing" || !renderer.value || !canvas.value) return
    const rect = canvas.value.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    const { width, height } = renderer.value.getSize()
    ambulanceX.value = clamp(x, 15, width - 15)
    ambulanceY.value = clamp(y, 0, height - 64)
  }

  function resize() {
    renderer.value?.resize()
  }

  function saveScore() {
    const key = `civilwar_scores_${difficulty.value}`
    const raw = localStorage.getItem(key)
    const scores: { score: number; date: string }[] = raw ? JSON.parse(raw) : []
    scores.push({ score: score.value * 1000, date: new Date().toISOString() })
    scores.sort((a, b) => b.score - a.score)
    if (scores.length > 10) scores.length = 10
    localStorage.setItem(key, JSON.stringify(scores))
  }

  function getLeaderboard(diff: DifficultyName) {
    const key = `civilwar_scores_${diff}`
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  }

  function getData() {
    return {
      rules: data.rules,
      knowledge: data.knowledge,
      rumors: data.rumors as [string, string][],
      getLeaderboard
    }
  }

  // 清理
  onUnmounted(() => {
    cancelAnimationFrame(gameLoopRAF)
    if (readyTimer) clearInterval(readyTimer)
    if (bgMusicTimer) clearTimeout(bgMusicTimer)
  })

  return {
    init,
    beginGame,
    handleMove,
    resize,
    getData,
    state,
    score,
    combo,
    maxCombo,
    level,
    hasDoubleFire,
    currentCapsuleInterval,
    currentCapsuleSpeed
  }
}
