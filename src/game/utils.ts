/** 工具函数 */

/** 返回 [min, max) 范围内的随机整数 */
export function randomInt(min: number, max: number): number {
  const range = Math.abs(max - min)
  return Math.floor(Math.random() * range) + Math.min(min, max)
}

/** 检测是否为移动设备 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|BlackBerry/i.test(navigator.userAgent)
}

/** 限制数值在 [min, max] 范围内 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** 简易 DOM 创建辅助 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Partial<HTMLElementTagNameMap[K] & HTMLElement>,
  children?: (string | Node)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  if (attrs) {
    for (const [key, val] of Object.entries(attrs)) {
      if (key === "className") {
        el.className = val as string
      } else if (key === "textContent") {
        el.textContent = val as string
      } else if (key === "innerHTML") {
        el.innerHTML = val as string
      } else if (key.startsWith("on")) {
        ;(el as any)[key] = val
      } else {
        ;(el as any)[key] = val
      }
    }
  }
  if (children) {
    for (const child of children) {
      if (typeof child === "string") {
        el.appendChild(document.createTextNode(child))
      } else {
        el.appendChild(child)
      }
    }
  }
  return el
}

/** CSS 像素转数字 */
export function parsePixels(el: HTMLElement, prop: "left" | "top" | "width" | "height"): number {
  return parseInt(getComputedStyle(el)[prop], 10) || 0
}
