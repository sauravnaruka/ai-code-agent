# 🧠 AI Code Assistant (LLM-Powered Local Agent)

This is a command-line AI assistant powered by Google's Gemini API. It can explore directories, read file contents, write new files, and execute Python scripts — all from natural language instructions.

> Built for experimentation and learning — **use responsibly.**

---

## 🚀 Features

- 🌳 Explore directory structure (`getFilesInfo`)
- 📖 Read contents of files (`getFileContent`)
- 📝 Create or overwrite files (`writeFile`)
- 🐍 Run Python files and return output/errors (`runPythonFile`)
- 🧠 Intelligent command loop powered by `@google/genai`

---

## 🛠️ Installation

```bash
git clone git@github.com:sauravnaruka/ai-code-agent.git
cd ai-code-agent
npm install
```

Set up your Gemini API key:
```bash
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

## 🧪 Usage

```bash
npm run dev -- "Write a Python file that prints 'Hello, AI!' and run it"
```

Use --verbose to print detailed logs and intermediate function calls:

```bash
npm run dev -- "Read the contents of package.json" --verbose
```

## 📁 Directory Structure
```bash
workspace/                  # Root working directory for all AI file ops
src/
  └── utils/file/           # Core utility functions for file I/O and execution
  └── main.ts               # Main command-line interface
  └── llmDefinitions.ts     # Function schema declarations
  └── llmFunctionCaller.ts  # Dispatch logic for handling LLM function calls
  └── llmPrompts.ts         # System prompt used for AI instructions
```
## ⚠️ Caution: Code Execution & Safety
This assistant executes Python code locally based on natural language prompts. Please note:

🧨 AI-driven code execution is inherently risky.

🔒 There is no sandboxing or strict security enforcement.

🧠 The LLM may inadvertently or intentionally write/execute harmful code.

⚠️ Do NOT use this project on production machines or with access to sensitive data.

This project is intended for learning, exploration, and prototyping only.

## 🧱 Tech Stack
- Node.js + TypeScript
- Gemini 1.5 API (@google/genai)
- Commander (for CLI)
- Native fs and child_process APIs for file interaction & execution

## 🧑‍💻 License
MIT — for educational and non-commercial use only.