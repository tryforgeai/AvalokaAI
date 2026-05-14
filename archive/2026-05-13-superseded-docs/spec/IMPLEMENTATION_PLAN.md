# Implementation Plan

- [ ] **Phase 1: Setup**
    - 创建项目结构。
    - 初始化 `requirements.txt`。
    - 编写 `ollama_client.py` 确保能连接本地 Ollama 服务。

- [ ] **Phase 2: RAG Pipeline**
    - 实现 `ingest.py`: 将测试语料导入 ChromaDB。
    - 实现 `retriever.py`: 测试检索准确度。

- [ ] **Phase 3: Core Logic**
    - 实现 `chains.py`: 组装 LangChain 逻辑，注入 `PERSONA_SPEC`。

- [ ] **Phase 4: Interface**
    - 开发 `ui.py`: 使用 Streamlit 构建单页聊天界面。

- [ ] **Phase 5: Refinement**
    - 添加流式输出 (Streaming)。
    - 实现本地对话历史持久化。