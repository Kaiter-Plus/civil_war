# 全民战疫

一款防疫主题的飞机大战游戏，使用 Vue 3.6 Vapor + Canvas 渲染 + TypeScript 开发。

## 技术栈

- **框架**: Vue 3.6 Vapor Mode
- **运行时**: TypeScript 5.x
- **构建工具**: Vite 6.x
- **样式**: Tailwind CSS v4
- **包管理**: Bun
- **渲染**: Canvas 2D

## 功能特性

- 三种难度模式（简单/普通/困难），带选中状态反馈
- 动态难度系统（击杀病毒自动升级）
- 角色加强系统（每3级射速+8%/弹速+10%，10级解锁双发）
- 连杀奖励机制（3连杀起显示奖励倍数）
- Canvas 粒子特效（星空背景、尾焰、击杀爆炸）
- 分数飘字
- 本地排行榜（按难度分开 Top 10）
- 防疫知识/谣言卡片
- 响应式布局（9:16 固定比例）
- 完整音效系统（淡入淡出背景音乐）

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
├── main.ts            # Vue Vapor 入口
├── App.vue            # 根组件（状态管理）
├── components/
│   ├── MenuScreen.vue     # 菜单界面
│   ├── GameCanvas.vue     # 游戏画布
│   ├── Modal.vue          # 弹窗组件
│   └── ResultScreen.vue   # 结算界面
├── composables/
│   └── useGame.ts         # 游戏逻辑封装
├── game/
│   ├── renderer.ts        # Canvas 渲染器
│   ├── audio.ts           # 音频管理
│   ├── config.ts          # 配置 & 资源导入
│   ├── types.ts           # 类型定义
│   └── utils.ts           # 工具函数
├── css/
│   ├── index.css          # 全局样式
│   └── tailwind.css       # Tailwind 入口
├── img/                   # 游戏实体图片
├── assets/
│   ├── img/               # UI 图片
│   └── json/              # 防疫数据
├── music/                 # 音效 (mp3)
└── index.html             # 入口 HTML
```

## 构建产物

- JS: ~97KB (gzip ~44KB)
- CSS: ~19KB (gzip ~4.6KB)

## 开发历史

### v3.0.0 (2026-04-09)

- 重构：原生 TS → Vue 3.6 Vapor Mode
- 样式：原生 CSS → Tailwind CSS v4
- 新增：角色加强系统（射速/弹速/双发）
- 新增：难度按钮选中状态反馈
- 新增：游戏界面显示难度名称
- 优化：组件化架构，逻辑封装为 composable
- 修复：音频淡入淡出音量越界 bug

### v2.0.0 (2026-04-09)

- 重构：Webpack + jQuery → Vite + TypeScript
- 渲染：DOM → Canvas
- 新增：动态难度、连杀系统、粒子特效
- 新增：分数飘字、本地排行榜
- 优化：移除 jQuery/Bootstrap 依赖
- 优化：音频文件精简（删除 ogg/wav）
- 优化：响应式 9:16 固定比例布局
- 质量：启用 TypeScript 严格模式

### v1.x (2020-04)

- 初始版本
- 基于 jQuery + Bootstrap 的 DOM 渲染
- 基础游戏功能

## License

MIT
