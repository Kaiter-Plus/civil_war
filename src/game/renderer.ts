import type { CapsuleEntity, VirusEntity, Particle, ScorePopup, Star } from "./types"

/** Canvas 渲染器 */
export class Renderer {
  private ctx: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement
  private width = 0
  private height = 0

  /** 预加载的图片资源 */
  private images: Record<string, HTMLImageElement> = {}

  /** 病毒旋转缓存 */
  private virusCache: Map<string, HTMLCanvasElement> = new Map()

  /** 背景星星 */
  stars: Star[] = []

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.resize()
    window.addEventListener("resize", () => this.resize())
  }

  /** 调整画布大小 */
  resize(): void {
    const parent = this.canvas.parentElement!
    const dpr = window.devicePixelRatio || 1
    this.width = parent.clientWidth
    this.height = parent.clientHeight
    this.canvas.width = this.width * dpr
    this.canvas.height = this.height * dpr
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // 重新生成星星
    this.initStars()
  }

  /** 初始化背景星星 */
  private initStars(): void {
    const count = Math.floor((this.width * this.height) / 8000)
    this.stars = []
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 0.5 + Math.random() * 1.5,
        speed: 0.01 + Math.random() * 0.03,
        alpha: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 0.001 + Math.random() * 0.003,
        twinkleOffset: Math.random() * Math.PI * 2
      })
    }
  }

  /** 预加载图片，返回 Promise */
  async loadImages(sources: Record<string, string>): Promise<void> {
    const entries = Object.entries(sources)
    await Promise.all(
      entries.map(
        ([key, src]) =>
          new Promise<void>((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
              this.images[key] = img
              resolve()
            }
            img.onerror = reject
            img.src = src
          })
      )
    )
    this.virusCache.clear()
  }

  /** 获取画布逻辑尺寸 */
  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height }
  }

  /** 清空画布 */
  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  /** 绘制背景（暗色 + 星星） */
  drawBackground(now: number): void {
    // 暗色渐变背景
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.height)
    grad.addColorStop(0, "#0a0e1a")
    grad.addColorStop(0.5, "#111827")
    grad.addColorStop(1, "#0f172a")
    this.ctx.fillStyle = grad
    this.ctx.fillRect(0, 0, this.width, this.height)

    // 星星闪烁
    for (const star of this.stars) {
      star.y += star.speed
      if (star.y > this.height) {
        star.y = 0
        star.x = Math.random() * this.width
      }
      const twinkle = 0.5 + 0.5 * Math.sin(now * star.twinkleSpeed + star.twinkleOffset)
      this.ctx.globalAlpha = star.alpha * twinkle
      this.ctx.fillStyle = "#fff"
      this.ctx.beginPath()
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      this.ctx.fill()
    }
    this.ctx.globalAlpha = 1
  }

  /** 绘制救护车 + 尾焰 */
  drawAmbulance(x: number, y: number, now: number): void {
    const img = this.images.ambulance
    if (!img) return
    this.ctx.drawImage(img, x - 15, y, 30, 64)

    // 尾焰效果
    const flameHeight = 10 + Math.sin(now * 0.02) * 4
    const flameWidth = 6 + Math.sin(now * 0.03) * 2
    const grad = this.ctx.createLinearGradient(x, y + 64, x, y + 64 + flameHeight)
    grad.addColorStop(0, "rgba(255, 200, 50, 0.9)")
    grad.addColorStop(0.4, "rgba(255, 100, 20, 0.6)")
    grad.addColorStop(1, "rgba(255, 50, 0, 0)")
    this.ctx.fillStyle = grad
    this.ctx.beginPath()
    this.ctx.moveTo(x - flameWidth / 2, y + 64)
    this.ctx.quadraticCurveTo(
      x - flameWidth * 0.8,
      y + 64 + flameHeight * 0.6,
      x,
      y + 64 + flameHeight
    )
    this.ctx.quadraticCurveTo(
      x + flameWidth * 0.8,
      y + 64 + flameHeight * 0.6,
      x + flameWidth / 2,
      y + 64
    )
    this.ctx.fill()

    // 内焰（更亮更窄）
    const innerHeight = flameHeight * 0.6
    const innerWidth = flameWidth * 0.5
    const innerGrad = this.ctx.createLinearGradient(x, y + 64, x, y + 64 + innerHeight)
    innerGrad.addColorStop(0, "rgba(255, 255, 200, 0.8)")
    innerGrad.addColorStop(1, "rgba(255, 200, 50, 0)")
    this.ctx.fillStyle = innerGrad
    this.ctx.beginPath()
    this.ctx.moveTo(x - innerWidth / 2, y + 64)
    this.ctx.quadraticCurveTo(x, y + 64 + innerHeight, x + innerWidth / 2, y + 64)
    this.ctx.fill()
  }

  /** 绘制胶囊 */
  drawCapsule(capsule: CapsuleEntity): void {
    const img = this.images.capsule
    if (!img) return
    this.ctx.drawImage(img, capsule.x - 7, capsule.y, 14, 26)

    // 胶囊拖尾
    this.ctx.globalAlpha = 0.3
    const trailGrad = this.ctx.createLinearGradient(
      capsule.x,
      capsule.y + 26,
      capsule.x,
      capsule.y + 40
    )
    trailGrad.addColorStop(0, "#66ccff")
    trailGrad.addColorStop(1, "rgba(102, 204, 255, 0)")
    this.ctx.fillStyle = trailGrad
    this.ctx.fillRect(capsule.x - 2, capsule.y + 26, 4, 14)
    this.ctx.globalAlpha = 1
  }

  /** 绘制病毒 */
  drawVirus(virus: VirusEntity): void {
    const isKilled = virus.killedAt !== null
    const img = isKilled ? this.images.killed : this.images.virus
    if (!img) return

    this.ctx.save()
    const cx = virus.x + virus.width / 2
    const cy = virus.y + virus.height / 2
    this.ctx.translate(cx, cy)
    this.ctx.rotate(virus.rotation)

    // 击杀后淡出
    if (isKilled) {
      const age = performance.now() - virus.killedAt!
      if (age < 300) {
        // 闪白
        this.ctx.globalAlpha = age < 100 ? 0.5 + 0.5 * (age / 100) : 1
        this.ctx.filter = age < 100 ? "brightness(3)" : "brightness(1)"
      } else if (age < 500) {
        this.ctx.globalAlpha = 1 - (age - 300) / 200
      }
    }

    this.ctx.drawImage(img, -virus.width / 2, -virus.height / 2, virus.width, virus.height)
    this.ctx.filter = "none"
    this.ctx.restore()
  }

  /** 绘制粒子 */
  drawParticles(particles: Particle[]): void {
    for (const p of particles) {
      const alpha = p.life / p.maxLife
      this.ctx.globalAlpha = alpha
      this.ctx.fillStyle = p.color
      this.ctx.beginPath()
      this.ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
      this.ctx.fill()
    }
    this.ctx.globalAlpha = 1
  }

  /** 绘制分数飘字 */
  drawScorePopups(popups: ScorePopup[]): void {
    for (const p of popups) {
      const progress = 1 - p.life / p.maxLife
      const alpha = p.life < 200 ? p.life / 200 : 1
      const offsetY = progress * 40
      const scale = progress < 0.1 ? 0.5 + progress * 5 : 1

      this.ctx.save()
      this.ctx.globalAlpha = alpha
      this.ctx.translate(p.x, p.y - offsetY)
      this.ctx.scale(scale, scale)
      this.ctx.font = 'bold 20px "Microsoft YaHei", sans-serif'
      this.ctx.textAlign = "center"
      this.ctx.textBaseline = "middle"
      // 描边
      this.ctx.strokeStyle = "rgba(0,0,0,0.5)"
      this.ctx.lineWidth = 3
      this.ctx.strokeText(p.text, 0, 0)
      // 填充
      this.ctx.fillStyle = p.color
      this.ctx.fillText(p.text, 0, 0)
      this.ctx.restore()
    }
    this.ctx.globalAlpha = 1
  }

  /** 绘制分数 + 连杀信息 */
  drawScore(
    score: number,
    combo: number,
    difficultyName: string,
    level: number,
    hasDoubleFire: boolean = false
  ): void {
    // 分数
    this.ctx.font = 'bold 18px "Microsoft YaHei", sans-serif'
    this.ctx.fillStyle = "#fff"
    this.ctx.textAlign = "left"
    this.ctx.textBaseline = "top"
    this.ctx.strokeStyle = "rgba(0,0,0,0.4)"
    this.ctx.lineWidth = 2
    const scoreText = `${score * 1000}`
    this.ctx.strokeText(`分数: ${scoreText}`, 15, 15)
    this.ctx.fillText(`分数: ${scoreText}`, 15, 15)

    // 连杀
    if (combo >= 3) {
      const comboAlpha = combo >= 10 ? 1 : 0.7 + 0.3 * (combo / 10)
      this.ctx.globalAlpha = comboAlpha
      this.ctx.font = `bold ${16 + Math.min(combo, 10)}px "Microsoft YaHei", sans-serif`
      const comboColors = ["#ffcc00", "#ff8800", "#ff4444", "#ff00ff"]
      this.ctx.fillStyle = comboColors[Math.min(Math.floor(combo / 3) - 1, 3)]
      this.ctx.textAlign = "right"
      this.ctx.strokeText(`${combo} 连杀!`, this.width - 15, 15)
      this.ctx.fillText(`${combo} 连杀!`, this.width - 15, 15)
      this.ctx.globalAlpha = 1
    }

    // 左上角状态：难度名称 + 等级
    this.ctx.font = '12px "Microsoft YaHei", sans-serif'
    this.ctx.textAlign = "left"

    // 难度名称（带颜色）
    const diffColors: Record<string, string> = {
      简单: "#4ade80",
      普通: "#60a5fa",
      困难: "#f87171"
    }
    this.ctx.fillStyle = diffColors[difficultyName] || "#fff"
    this.ctx.fillText(difficultyName, 15, 40)

    // 等级
    this.ctx.fillStyle = "rgba(255,255,255,0.7)"
    this.ctx.fillText(`  Lv.${level}`, 15 + this.ctx.measureText(difficultyName).width, 40)

    // 角色加强状态（第二行）
    if (hasDoubleFire) {
      this.ctx.fillStyle = "#fbbf24"
      this.ctx.fillText("双发⚡", 15, 56)
    }
  }

  /** 绘制 Ready/GO 文字 */
  drawReadyText(text: string, fontSize: number): void {
    this.ctx.font = `bold ${fontSize}px "Microsoft YaHei", sans-serif`
    this.ctx.fillStyle = "red"
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"
    this.ctx.globalAlpha = fontSize >= 80 ? Math.max(0, 1 - (fontSize - 80) / 60) : 1
    this.ctx.fillText(text, this.width / 2, this.height / 2)
    this.ctx.globalAlpha = 1
  }
}
