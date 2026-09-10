# DZX · DIGITAL EXPLORER

> **BUILD. CREATE. EVOLVE.**
> Bridging synthetic intelligence, resilient software architecture, cinematic visual storytelling, and relentless physical discipline into coherent digital frontiers.

基于 **React 19 + TypeScript + Three.js + Vite** 构建的高性能个人作品集与全 3D 空间叙事网站。

---

## ✨ 核心技术与视觉亮点

1. **持续性 3D 世界穿梭 (Persistent 3D World)**：
   - 滚动驱动的三维三次埃尔米特样条摄像机轨迹（Cubic Hermite Spline Camera Path）。
   - **HOME → ABOUT 侧翼机动与物理遮挡**：镜头向右大幅度横向绕飞，擦过 DZX Core 侧翼边缘，呈现强烈的剪影遮挡与立体视差。
   - **DZX Core 黑曜石透射与 3.6s 心跳脉冲**：半透明黑曜石材质，内置八面体神经晶核与数据流动点阵，每 3.6 秒微弱搏动一次樱粉（`#F2C8D0`）微光。
   - **Core 三维物理解构**：神石在滚动推进中拆解为 `COGNITION`、`SYSTEM`、`BODY / AESTHETICS` 三大悬浮模块，与 DOM 卡片精准呼应，正反滚动 100% 连续可逆。

2. **各章节独立 3D 视觉语言 (Scene Identity Pass · 2.2)**：
   - **INTERESTS (感官与身体修养)**：告别通用科技球，采用全新抽象三元几何——悬浮光学取景框（16:9 / 2.39:1 变形画幅与光圈刻度）、环形模拟合成器音频频谱波形、以及流线型动力学力线轨迹弧。
   - **PHILOSOPHY (持续重构哲学)**：极简沉静的空间演化曲线（Evolution Curve），随滚动动态分叉、推演与汇合，具象表达思维与架构的持续重构。
   - **CONTACT (连接与超越)**：滚动到底部时背景粒子渐进衰减（100% → 60% → 25% → 8%），仅留极少发光星尘、纯粹排版与联系入口，极度静谧收尾。

3. **XiaoZhaiOS 记忆语义系统与穿越时序 (Semantic Memory & Portal Flight)**：
   - **Memory Core 认知网络**：中央记忆晶格核连接四大认知节点（`RAW` 原始流、`CONTEXT` 上下文图谱、`SELF` 数字分身边界、`LONG-TERM` 向量持久层）与时间线数据矩阵（2025/2026/SYNAPSE）。
   - **精准穿越时序**：点击后 0-25% 原项目 UI 快速淡出 → 20-65% 纯空间飞行（无 HUD 遮挡）→ 60-80% 记忆系统闪烁显现 → 75-100% HUD 平滑呈现。
   - **主世界空间隔离**：普通滚动时 XiaoZhaiOS 保持静默待命，彻底消除与 Chapter 3 的视觉冲突。
   - 空间内支持 **360° 球面阻尼自由旋转拖拽、滚轮焦距缩放 (FOV)、鼠标光影感应与点击背景平滑倒流返回**。

4. **存在识别交互系统 (Presence Recognition · 2.3.0 / 2.3.1 Polish)**：
   - **“Interaction discovered, not announced.”** 极度克制、冷静的数字装置艺术级感知语言。
   - **视觉几何与碰撞体解耦 (Visual-Proxy Decoupling · 2.3.1)**：视觉八面体（半径 0.32），射线检测专用隐形球形代理（半径 0.42），彻底规避线框阈值扩大问题；桌面端近距兜底收紧至 20px（移动端 32px）。
   - **单通道射线检测与三维遮挡剔除 (Single-pass Raycast & Depth Occlusion · 2.3.1)**：Core 与认知节点合并入单次有序射线检测；若 Core 位于前方（距离更近），其后方节点被物理遮挡，无法穿透聚焦或触发。
   - **Core 探测与节点聚焦解耦**：掠过 Core 仅激发表面菲涅尔微光接触点；仅在光标触及记忆节点时才收紧光标（0.72x）、唤出微描述器与激活 Dwell 驻留。
   - **全链路零垃圾回收 (Zero GC Hot Loop · 2.3.1)**：预分配射线交点数组、遮挡检测器与相机演算向量；消除 `applyToCamera()` 逐帧对象分配，彻底抹除 Hot Loop 内存抖动。
   - **60fps React 渲染桥断开 (Direct DOM Transform · 2.3.1)**：光标阻尼平滑与描述器跟随完全由 DOM Ref `transform` 驱动，仅在离散状态（`hoveredNodeId`, `selectedNodeId`, `isFocused`, `isCoreHit`）变化时触发 React 更新。
   - **落地时序与微引导线自适应边缘对齐 (Adaptive Placement · 2.3.1)**：微提示文本严格在镜头落位完成（`isPortalLanded`）后 600ms 静默浮现；节点描述器根据屏幕象限智能翻转（左/右、上/下），避让顶部 HUD 并避免屏幕边缘截断。

5. **DOM 与 3D 深度绑定 (Spatial Position-Driven Reveal)**：
   - 各章节文本与卡片依据摄像机在 3D 空间中的深度进度被“发现”，适时淡入、对齐、漂移与退场。

6. **内置多版本对比控制器 (DZX · SIGNAL [H])**：
   - 右下角快捷按键 `[H]` 唤出控制台，支持字体、色调与渲染细节调优。

---

## 🚀 本地开发与构建

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产环境编译打包 (TypeScript 类型检查 + Vite 构建)
npm run build

# 预览构建产物
npm run preview
```

---

## 🛠️ 技术栈

- **Core**: React 19, TypeScript 5.7
- **3D Graphics**: Three.js (0.186.0)
- **Build Tool**: Vite 6.1
- **Typography**: Onest, Instrument Serif, Geist

