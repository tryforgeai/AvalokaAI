# Data Schema & RAG Specification

## 1. Knowledge Base Structure
语料应以 Markdown 格式存储于 `./data/knowledge_base/`，结构如下：
- `metadata`: 标题、作者（法师名称/经名）、分类（职场、情感、义理）。
- `content`: 正文。

## 2. Chunking Strategy
- **Method:** Semantic Chunking (优先按段落或意义完整性切分)。
- **Chunk Size:** 400-600 characters.
- **Overlap:** 50 characters (保持语境连续性)。

## 3. Retrieval Strategy
- **Top K:** 3 (每次检索最相关的 3 个片段)。
- **Score Threshold:** 0.6 (过滤低相关性内容)。