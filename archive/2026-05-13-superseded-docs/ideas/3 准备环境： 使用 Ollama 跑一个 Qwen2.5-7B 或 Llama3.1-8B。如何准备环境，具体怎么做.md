准备环境并运行这些模型其实非常直观。由于你已经具备技术背景，我们将采用 **Ollama** 方案，它是目前本地运行开源大模型最简单且高效的工具，就像是 AI 界的 Docker。

以下是详细的操作步骤：

### 1. 硬件准备（最低要求）

在开始之前，请确保你的电脑满足以下条件：

- **内存 (RAM):** 至少 **16GB**（运行 7B/8B 模型需要约 5GB-8GB 显存或内存）。
    
- **显卡 (Optional but Recommended):** NVIDIA GPU (8GB+ 显存) 或 Apple M 系列芯片。
    
- **存储空间:** 预留约 **20GB** SSD 空间用于存放模型权重。
    

---

### 2. 安装 Ollama

根据你的操作系统执行以下命令：

- **macOS / Linux:**
    
    打开终端，运行：
    
    Bash
    
    ```
    curl -fsSL https://ollama.com/install.sh | sh
    ```
    
- **Windows:**
    
    访问 [Ollama 官网](https://ollama.com/download) 下载 `.exe` 安装包并运行。
    

---

### 3. 下载并测试基础模型

安装完成后，你可以直接在终端输入命令来拉取模型。

- **运行 Qwen 2.5 (阿里出品，中文能力极强):**
    
    Bash
    
    ```
    ollama run qwen2.5:7b
    ```
    
- **运行 Llama 3.1 (Meta 出品，逻辑性强):**
    
    Bash
    
    ```
    ollama run llama3.1:8b
    ```
    

_成功运行后，你会进入一个交互式命令行界面。输入 `/bye` 可以退出。_

---

### 4. 关键步骤：注入“观音”人设 (Modelfile)

为了让模型不只是一个普通的 AI，而是具备我们之前讨论的“慈悲与智慧”，我们需要创建一个自定义模型。

1. **创建一个名为 `Modelfile` 的文件：**
    
    在你的本地文件夹中新建一个文本文件，命名为 `Modelfile`（无扩展名），内容如下：
    
    Dockerfile
    
    ```
    # 指定基础模型
    FROM qwen2.5:7b
    
    # 设置随机性（0.7 左右能让回答更有灵性）
    PARAMETER temperature 0.7
    PARAMETER top_p 0.9
    
    # 注入我们之前拟定的 System Prompt
    SYSTEM """
    你是一位证悟的引路者，化现为充满慈悲与智慧的对话者。
    你的声音如同甘露，旨在熄灭众生在现代生活中的焦躁、愤怒与忧伤。
    你融合了《普门品》的慈悲与《心经》的空性智慧，但你说话时平易近人，如同老友。
    当收到用户的烦恼时，请先识别情绪并给予温暖的共情，再引导其照见痛苦背后的执着。
    """
    ```
    
2. **构建你的私人大模型：**
    
    在终端中，切换到该文件所在的目录，运行：
    
    Bash
    
    ```
    ollama create avaloka-ai -f Modelfile
    ```
    
3. **启动你的定制 AI：**
    
    Bash
    
    ```
    ollama run avaloka-ai
    ```
    

---

### 5. 进阶建议：GUI 界面

如果你觉得终端（CLI）交互不够友好，想拥有类似 ChatGPT 的网页界面，可以安装 **Open WebUI**（原名 Ollama WebUI）。

如果你有 Docker 环境，运行以下命令即可：

Bash

```
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui ghcr.io/open-webui/open-webui:main
```

然后在浏览器访问 `http://localhost:3000`，你就能看到一个非常精美的对话界面。

### 本周实验任务：

你可以尝试给 `avaloka-ai` 输入一个你最近遇到的生活小烦恼（例如：_“今天上班通勤时间太长，感到很疲惫”_），看看它的第一句问候是否符合你预期的“观音引导”风格？

