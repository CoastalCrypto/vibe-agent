# Vibe Agent

A desktop app for vibe coding with local LLMs. Describe what you want to build in plain English, answer a few quick questions, then watch the agent generate a complete multi-file project — live, token by token — directly to your filesystem.

Built with Electron, React, TypeScript, and Monaco Editor. Works with any OpenAI-compatible endpoint (Ollama, LM Studio, OpenRouter, the real OpenAI API, etc.).

---

## What it does

1. **Describe your project** — type a prompt like "build a Discord bot that posts daily weather updates"
2. **Answer clarifying questions** — the agent asks 3-5 quick questions to pin down scope (language, features, style)
3. **Watch it build** — files stream to disk in real time with live syntax highlighting; a file tree tracks progress
4. **Open when done** — open the output folder or launch VS Code directly from the app

All generated projects land in `~/vibe-projects/<project-name>-<date>` by default.

---

## Prerequisites

- **Node.js** 18+ and **npm** 9+
- A running LLM endpoint — Ollama is the easiest local option:
  ```
  brew install ollama          # macOS
  winget install Ollama.Ollama # Windows
  ```
  Then pull a model:
  ```
  ollama pull qwen2.5-coder:7b
  ```
- **VS Code** (optional) — only needed if you enable "Open in VS Code when done"

---

## Install

```bash
git clone https://github.com/CoastalCrypto/vibe-agent.git
cd vibe-agent
npm install
```

---

## Run in development

```bash
npm run dev
```

This starts the Electron app with Vite hot-reload. The DevTools panel opens automatically.

---

## Build a distributable

```bash
# Windows installer (.exe)
npm run build:win

# macOS .dmg
npm run build:mac

# Linux AppImage
npm run build:linux
```

Output lands in the `dist/` folder.

---

## Configuration

Open the settings panel with the **⚙** button (top-right of the prompt bar).

| Setting | Default | Description |
|---|---|---|
| Model Endpoint | `http://localhost:11434/v1` | Any OpenAI-compatible base URL |
| Model Name | `qwen2.5-coder:7b` | Model ID passed to the endpoint |
| API Key | *(empty)* | Required for OpenRouter / OpenAI; leave blank for local Ollama |
| Workspace Directory | `~/vibe-projects` | Where generated projects are written |
| Open in VS Code when done | on | Runs `code <project-path>` after generation completes |

Settings are persisted across sessions.

### Using with OpenAI

1. Set **Model Endpoint** to `https://api.openai.com/v1`
2. Set **Model Name** to `gpt-4o` (or any chat model)
3. Paste your API key into **API Key**

### Using with OpenRouter

1. Set **Model Endpoint** to `https://openrouter.ai/api/v1`
2. Set **Model Name** to e.g. `anthropic/claude-3-5-sonnet`
3. Paste your OpenRouter API key into **API Key**

### Using with LM Studio

1. Start LM Studio's local server (default port 1234)
2. Set **Model Endpoint** to `http://localhost:1234/v1`
3. Leave **API Key** blank

---

## Project layout

```
electron/          Main process
  agent/           LLM pipeline (clarify → plan → stream)
  ipc.ts           IPC handler registration
  main.ts          BrowserWindow bootstrap
  preload.ts       contextBridge API surface
  settings.ts      electron-store wrapper
  workspace.ts     File write + VS Code / Explorer helpers

src/               Renderer (React)
  components/      UI panels (PromptBar, QAPanel, FileTreePanel, CodeStreamPanel, SettingsModal)
  store/           Zustand session store
  lib/             useAgentEvents IPC hook

tests/             Vitest test suite (node + jsdom environments)
```

---

## Development scripts

| Command | Description |
|---|---|
| `npm run dev` | Start app with hot-reload |
| `npm run build` | Typecheck + production build |
| `npm test` | Run test suite |
| `npm run typecheck` | TypeScript check only (no emit) |

---

## Tech stack

- **Electron 39** + **electron-vite 5** — desktop shell and build tooling
- **React 19** + **TypeScript 5** — renderer UI
- **Zustand 5** — renderer state management
- **Monaco Editor** — live syntax-highlighted token streaming
- **openai SDK** — LLM client (OpenAI-compatible)
- **electron-store 8** — persistent settings
- **Tailwind CSS 3** — styling
- **Vitest 4** + **Testing Library** — unit and component tests
