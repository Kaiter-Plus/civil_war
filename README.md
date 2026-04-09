# 全民战疫

一款防疫主题的飞机大战游戏，使用 Canvas 渲染 + TypeScript 开发。

## 技术栈

- **运行时**: TypeScript 5.x
- **构建工具**: Vite 6.x
- **包管理**: Bun
- **渲染**: Canvas 2D
- **UI**: 原生 DOM + CSS

## 功能特性

- 三种难度模式（简单/普通/困难）
- 动态难度系统（击杀病毒自动升级）
- 连杀奖励机制
- Canvas 粒子特效（尾焰、击杀爆炸）
- 分数飘字
- 本地排行榜（按难度分开）
- 防疫知识/谣言卡片
- 响应式布局（9:16 固定比例）
- 完整音效系统

## 快速开始

```bash
# 安装依赖
bun install

# 开发模式
bun run dev

# 构建
bun run build

# 预览构建产物
bun run preview
```

## 项目结构

```
src/
├── game/
│   ├── index.ts      # 入口
│   ├── game.ts       # 游戏主循环
│   ├── renderer.ts   # Canvas 渲染器
│   ├── audio.ts      # 音频管理
│   ├── config.ts     # 配置 & 资源导入
│   ├── types.ts      # 类型定义
│   └── utils.ts      # 工具函数
├── css/index.css     # 样式
├── img/              # 游戏实体图片
├── assets/
│   ├── img/          # UI 图片
│   └── json/         # 防疫数据
├── music/            # 音效 (mp3)
└── index.html        # 入口 HTML
```

## 构建产物

- JS: ~49KB (gzip ~24KB)
- CSS: ~7KB (gzip ~2KB)

## 开发历史

### v2.0.0 (2026-04-09)

- 重构：Webpack + jQuery → Vite + TypeScript
- 渲染：DOM → Canvas
- 新增：动态难度、连杀系统、粒子特效
- 新增：分数飘字、本地排行榜
- 优化：移除 jQuery/Bootstrap 依赖
- 优化：音频文件精简（删除 ogg/wav）
- 优化：响应式 9:16 固定比例布局

### v1.x (2020-04)

- 初始版本
- 基于 jQuery + Bootstrap 的 DOM 渲染
- 基础游戏功能

## License

MIT
