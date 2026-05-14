# Project Spec: Avaloka AI (Monolithic Prototype)

## 1. Project Goal
构建一个基于佛法智慧的私人 AI 助手，旨在通过 RAG（检索增强生成）技术解决用户的现实生活烦恼（压力、焦虑、人际关系）。

## 2. Tech Stack
- **Language:** Python 3.10+
- **LLM Runner:** Ollama (Target Model: qwen2.5:7b)
- **Framework:** FastAPI (Backend), Streamlit (Frontend UI)
- **Orchestration:** LangChain / LangGraph
- **Vector Database:** ChromaDB (Local/Embedded)
- **Embedding Model:** BGE-M3 (Local via HuggingFace)

## 3. Core Modules
- **Ingestion Engine:** 处理本地 Markdown 格式的经论与开示，进行语义切片并入库。
- **Compassion Chain:** - 意图识别 (Intent Analysis)
    - 语义检索 (Semantic Retrieval)
    - 智慧回答 (Compassionate Response Generation)
- **Memory:** 使用本地磁盘存储对话历史，保持上下文连贯。

## 4. Environment Constraints
- 运行于 Mac Mini (Apple Silicon)。
- 所有数据必须保存在本地，禁止调用外部闭源 API。
- 向量库路径: `./data/vector_db`
- 语料库路径: `./data/knowledge_base`