为了让你在开发时更有全局感，我将之前拆解的 **6 周开发步骤** 与我们之前在 Obsidian 中设计的 **系统架构图 (System Diagram)** 进行精准映射。

你可以对照下表，清晰地看到每一条终端命令和每一行代码最终落在了架构的哪个位置。

---

### 系统模块与开发步骤映射表

|**开发阶段**|**核心任务**|**对应的系统架构模块**|**物理位置 (Mac Mini 目录)**|
|---|---|---|---|
|**Phase 1: Setup**|基础环境、安全配置、`security_config.py`|**Monolithic Server (Python Logic)**|项目根目录 `/`|
|**Phase 2: RAG**|语料切片、Embedding、向量入库 `ingest.py`|**RAG Pipeline (LangChain + ChromaDB)**|`./data/vector_db`|
|**Phase 3: Logic**|意图识别、System Prompt、对话链 `logic.py`|**Intelligence Engine (Ollama) & Backend Logic**|项目根目录 `/`|
|**Phase 4: UI**|前端交互、Markdown 渲染、流式输出 `ui.py`|**User Layer (Streamlit UI)**|项目根目录 `/`|
|**Phase 5: Testing**|红队测试、危机干预话术、性能调优|**Security & System-wide Alignment**|全局|

---

### 详细步骤逻辑分解

#### 1. 基础设施模块 (Infrastructure & Logic Layer)

- **对应步骤：** Phase 1 (环境初始化)
    
- **执行逻辑：** 这是你整个单体架构的“操作系统”。使用 `uv` 创建的虚拟环境和 `security_config.py` 是为了保护 **FastAPI / Python Logic** 这一层，确保它在调用大模型时是安全的、受控的。
    
- **命令重点：** `uv venv` 和 `security_config.py`。
    

#### 2. 知识检索模块 (RAG Pipeline)

- **对应步骤：** Phase 2 (数据工程)
    
- **执行逻辑：** 这一步处理的是架构图中 **Knowledge Base** 到 **ChromaDB** 的转化。
    
    - `ingest.py` 扮演了数据搬运工的角色。
        
    - **BGE-M3** 模型在本地运行，将 Markdown 转化为向量。
        
    - 它是 AI 能够提供“佛法依据”而非瞎编乱造的关键。
        

#### 3. 智慧推理模块 (Intelligence Engine)

- **对应步骤：** Phase 3 (核心逻辑与人设)
    
- **执行逻辑：** 这是连接 **Python Logic** 与 **Ollama (Qwen 2.5)** 的桥梁。
    
    - `logic.py` 负责将用户的问题与从 RAG 检索到的 Context 拼接。
        
    - 同时注入 **System Prompt (Person Spec)**，确保大模型的回复语调符合观音菩萨的慈悲感。
        
    - **Memory (对话历史)** 也运行在这里，确保单体环境下的上下文连贯。
        

#### 4. 用户交互模块 (User Layer / UI)

- **对应步骤：** Phase 4 (前端开发)
    
- **执行逻辑：** 对应架构图最顶层的 **Streamlit UI**。
    
    - `ui.py` 调用后端逻辑，并将结果以 Markdown 格式优雅地呈现。
        
    - 它是用户感知“慈悲与智慧”的直接窗口。
        

---

### 为什么这样拆分对“单体稳定性”至关重要？

作为工程管理者，这种映射能帮你实现 **“关注点分离” (Separation of Concerns)**：

1. **易于调试：** 如果 AI 回复不像观音，你只需要去 **Intelligence Engine** 调整 `PERSONA_SPEC.md`。
    
2. **易于升级：** 如果以后你想把 Qwen2.5 换成更强的 DeepSeek，你只需要改动 **Ollama** 层的配置，而不必动前端和向量数据库。
    
3. **数据安全：** 因为所有模块都映射在 Mac Mini 的本地目录，你可以在 `PROJECT_SPEC` 中强制要求 **RAG Pipeline** 永远不发起外部网络连接。
    

### 建议

在开始 Phase 1 之前，你可以先在 Obsidian 里为这四个模块分别建立 **[[笔记]]**。当 Claude Code 完成一段代码后，你可以直接把代码逻辑的摘要记录在对应的模块笔记下。

既然架构和步骤都已对齐，你是否已经准备好让 Claude 执行 **Phase 1** 的环境初始化命令了？