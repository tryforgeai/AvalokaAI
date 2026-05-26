# Avaloka V1 Chat MVP Design

日期：2026-05-16

状态：Implemented historical design for the local app now used as the R1 demo surface

R1 说明：本文保留为当前 local app 的设计来源，不定义 active product roadmap。

## 1. 目标

做一个极简本地聊天 MVP，用于第二轮 5-10 位用户免费测试。

这个 MVP 只验证一件事：

> 用户在低谷时打开 Avaloka，收到短而稳、身体落地的回应，然后留下反馈并愿意回来。

## 2. 非目标

V1 MVP 不做：

- 登录和账号。
- 云数据库。
- 支付。
- 社区。
- 完整 RAG。
- 语音、音乐、仪式或沉浸媒体。
- 医疗、心理治疗或危机服务定位。
- 长期人格陪伴或泛聊天。

## 3. 产品体验

第一屏不是 landing page，而是直接进入 Avaloka 使用体验。

用户首次打开时看到简短边界说明：

> Avaloka 是低谷时刻的私人陪伴，不是医疗、治疗或危机服务。

用户确认后进入聊天界面。界面应该安静、私密、低刺激，适合深夜使用。

## 4. UI 方向

视觉方向：

> 深夜书房里的低灯光。

关键词：

- 暖灰。
- 墨色。
- 低亮度米白。
- 小面积暖灯光。
- 大留白。
- 低刺激。
- 像私人笔记，不像 SaaS 后台。
- 不使用营销 hero。
- 不使用宗教视觉符号。
- 不使用泛 AI 紫色渐变。

## 5. 核心功能

### 5.1 Boundary Notice

首次打开展示：

- Avaloka 是私人情绪安顿陪伴。
- Avaloka 不是心理治疗、医疗建议或危机服务。
- 如果用户处于危险中，应联系现实中的可信赖的人、专业人员或当地紧急服务。
- 反馈会保存在本地浏览器，用户可导出或清空。

### 5.2 Chat

用户输入一段低谷描述。

系统处理顺序：

1. crisis safety gate
2. scenario matching
3. V1 response selection
4. response quality constraints
5. feedback prompt

V1 首版可以不接真实 LLM。先用本地规则和 V1 response library 做半自动选择，保证可控和安全。

### 5.3 Short Body-Grounded Response

每条普通回应默认三段：

1. 接住。
2. 稳住。
3. 落地。

禁止：

- 泛泛建议。
- 鸡汤。
- 追问为什么。
- 医疗建议。
- 宗教术语。
- 过度解释。

### 5.4 Feedback Capture

每次回应后收集：

- 这是真实低谷还是测试？
- 是否主动打开？
- 安顿评分 1-5。
- 最有帮助的一句话。
- 哪一句冷、泛泛、不对或不安全。
- 明天是否想继续。

### 5.5 Session Log

MVP 用 `localStorage` 保存会话和反馈。

用户或测试负责人可以：

- 查看最近记录。
- 导出 JSON。
- 清空本地记录。

## 6. 技术方案

推荐技术栈：

- Vite
- React
- TypeScript
- CSS Modules or plain CSS
- localStorage

应用目录：

```text
app/
  package.json
  index.html
  src/
    main.tsx
    App.tsx
    styles.css
    data/responseLibrary.ts
    lib/crisisGate.ts
    lib/responseSelector.ts
    lib/storage.ts
    types.ts
```

## 7. 成功标准

MVP 完成后应满足：

- 本地可以运行。
- 首次使用有边界说明。
- 用户可以输入低谷描述并收到短回应。
- 危机表达进入 crisis fallback。
- 普通回应来自 V1 response library。
- 反馈可以保存到 localStorage。
- 记录可以导出 JSON。
- UI 适合深夜低刺激使用。
