import type { CapsuleEntity, VirusEntity, Particle } from './types';

/** Canvas 渲染器 */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private width = 0;
  private height = 0;

  /** 预加载的图片资源 */
  private images: Record<string, HTMLImageElement> = {};

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  /** 调整画布大小 */
  resize(): void {
    const parent = this.canvas.parentElement!;
    const dpr = window.devicePixelRatio || 1;
    this.width = parent.clientWidth;
    this.height = parent.clientHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** 预加载图片，返回 Promise */
  async loadImages(sources: Record<string, string>): Promise<void> {
    const entries = Object.entries(sources);
    await Promise.all(
      entries.map(([key, src]) => new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => { this.images[key] = img; resolve(); };
        img.onerror = reject;
        img.src = src;
      }))
    );
  }

  /** 获取画布逻辑尺寸 */
  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  /** 清空画布 */
  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /** 绘制救护车 */
  drawAmbulance(x: number, y: number): void {
    const img = this.images.ambulance;
    if (!img) return;
    this.ctx.drawImage(img, x - 15, y, 30, 64);
  }

  /** 绘制胶囊 */
  drawCapsule(capsule: CapsuleEntity): void {
    const img = this.images.capsule;
    if (!img) return;
    this.ctx.drawImage(img, capsule.x - 7, capsule.y, 14, 26);
  }

  /** 绘制病毒 */
  drawVirus(virus: VirusEntity): void {
    const img = virus.killedAt !== null ? this.images.killed : this.images.virus;
    if (!img) return;

    this.ctx.save();
    const cx = virus.x + virus.width / 2;
    const cy = virus.y + virus.height / 2;
    this.ctx.translate(cx, cy);
    this.ctx.rotate(virus.rotation);
    this.ctx.drawImage(img, -virus.width / 2, -virus.height / 2, virus.width, virus.height);
    this.ctx.restore();
  }

  /** 绘制粒子 */
  drawParticles(particles: Particle[]): void {
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }

  /** 绘制分数 */
  drawScore(score: number): void {
    this.ctx.font = 'bold 16px "Microsoft YaHei", sans-serif';
    this.ctx.fillStyle = '#fff';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`分数: ${score * 1000}`, 15, 15);
  }

  /** 绘制 Ready/GO 文字 */
  drawReadyText(text: string, fontSize: number): void {
    this.ctx.font = `bold ${fontSize}px "Microsoft YaHei", sans-serif`;
    this.ctx.fillStyle = 'red';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.globalAlpha = fontSize >= 80 ? Math.max(0, 1 - (fontSize - 80) / 60) : 1;
    this.ctx.fillText(text, this.width / 2, this.height / 2);
    this.ctx.globalAlpha = 1;
  }
}
