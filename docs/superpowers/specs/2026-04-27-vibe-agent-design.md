# Vibe Agent — Design Spec

**Date:** 2026-04-27  
**Status:** Approved

---

## Overview

Vibe Agent is a desktop application for vibe coding with local LLMs. The user describes what they want to build, the agent asks clarifying questions, then generates a complete project by streaming each file to disk while the user watches the code come to life in real time.

---

## Decisions

| Dimension | Choice | Rationale |
|---|---|---|
| Platform | Electron 30 + Vite 5 + React 18 | Native desktop feel, VS Code DNA, modern DX |
| Model runtime | Any OpenAI-compatible endpoint | Works with Ollama, LM Studio, llama.cpp, Jan |
| Layout | Command Center | Prompt bar top, three panels bottom |
| Agent loop | Two-phase: JSON plan → per-file stream | Reliable with any local model, clean UX |
| Clarification | Batch quick-pick questions | One round, fast, clickable options |
| Code preview | Monaco Editor, token streaming | Syntax-highlighted, character-by-character |
| Output | New folder per session in `~/vibe-projects/` | Isolated, predictable, configurable |
| State management | Zustand | Minimal, no boilerplate |
| Settings persistence | electron-store | Survives app restarts |

---

## Layout — Command Center

```
┌─────────────────────────────────────────────────────────┐
│  VIBE AGENT          model: qwen2.5-coder   ● connected │
├─────────────────────────────────────────────────────────┤
│  ▸ [prompt input]                          [Send ↵]     │
├──────────────┬──────────────┬──────────────────────────┤
│  Q&A Panel   │  File Tree   │  Code Stream             │
│              │              │                          │
│  Agent asks  │  Files from  │  Monaco editor           │
│  3–5 batch   │  plan with   │  streaming tokens        │
│  questions   │  live status │  syntax-highlighted      │
│  with option │              │  for active file         │
│  chips       │  ✓ done      │                          │
│              │  ● writing   │  File tabs at bottom     │
│  [Start →]   │  ⟳ pending   │                          │
└──────────────┴──────────────┴──────────────────────────┘
│  ● 2 complete  ● 1 streaming  2 pending     session-name│
└─────────────────────────────────────────────────────────┘
```

---

## Agent Loop — Two-Phase

### Phase 0 — Clarify
- Main process calls LLM with system prompt: *"Generate 3–5 clarifying questions with 2–4 option choices each. Return JSON array: `[{question, options: string[]}]`."*
- User answers via clickable chips in Q&A panel
- "Start coding →" button activates when all questions answered

### Phase 1 — Plan
- Main process calls LLM with prompt + answers
- System prompt: *"Return a JSON array of files to create: `[{filename, description, language}]`. No code yet."*
- On success: workspace folder created, file tree panel populates instantly with all files as `pending`
- Retry once with stricter prompt if JSON fails to parse

### Phase 2 — Stream (sequential per file)
- For each file in plan, separate LLM call with system prompt: *"Write ONLY the file `{filename}`. Raw code only, no explanation, no markdown fences."*
- Tokens streamed over IPC → appended to Monaco editor
- File tree status: `pending` → `writing` → `done`
- File written to disk atomically on stream completion
- On stream error: mark file `failed`, continue to next file

---

## File Structure

```
vibe-agent/
├── electron/
│   ├── main.ts              # app entry, BrowserWindow
│   ├── ipc.ts               # contextBridge + IPC handlers
│   ├── workspace.ts         # folder creation, atomic file writes
│   └── agent/
│       ├── clarify.ts       # phase 0 — clarification questions
│       ├── plan.ts          # phase 1 — JSON file plan
│       └── stream.ts        # phase 2 — per-file token streaming
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── PromptBar.tsx    # top bar: input, submit, settings trigger
│   │   ├── QAPanel.tsx      # left: batch questions with option chips
│   │   ├── FileTreePanel.tsx # center: file list with live status
│   │   └── CodeStreamPanel.tsx # right: Monaco + file tabs
│   └── store/
│       └── session.ts       # Zustand store
├── vite.config.ts
└── package.json
```

---

## IPC Events (Main → Renderer)

| Event | Payload | Effect |
|---|---|---|
| `agent:clarify` | `{ questions: {question, options}[] }` | Renders Q&A panel |
| `agent:plan` | `{ files: {filename, description, language}[] }` | Populates file tree |
| `agent:file-start` | `{ filename, language }` | Activates file in tree + clears Monaco |
| `agent:token` | `{ token: string }` | Appends token to Monaco |
| `agent:file-complete` | `{ filename }` | Marks file done in tree, writes to disk |
| `agent:file-error` | `{ filename, error }` | Marks file failed, continues |
| `agent:done` | `{ workspacePath }` | Shows "Open in VS Code" / "Open in Explorer" |

---

## Zustand Session State

```typescript
type Phase = 'idle' | 'clarifying' | 'planning' | 'streaming' | 'done' | 'error'

interface SessionState {
  phase: Phase
  prompt: string
  questions: { question: string; options: string[]; selected: string | null }[]
  filePlan: { filename: string; description: string; language: string; status: 'pending' | 'writing' | 'done' | 'failed' }[]
  activeStream: { filename: string; content: string; language: string } | null
  workspacePath: string | null
  error: string | null
}
```

---

## Settings (electron-store)

| Key | Default | Description |
|---|---|---|
| `workspaceDir` | `~/vibe-projects` | Root folder for all generated projects |
| `modelEndpoint` | `http://localhost:11434/v1` | OpenAI-compatible base URL |
| `modelName` | `qwen2.5-coder:7b` | Model identifier sent in API requests |
| `apiKey` | `""` | Optional — for remote endpoints |
| `openInVSCode` | `true` | Auto-open VS Code on session complete |

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Phase 0/1 JSON parse failure | Retry once with stricter prompt; show raw error in Q&A panel if second attempt fails |
| File stream interrupted | Mark file `failed` in tree, continue to next file; surface retry button after session |
| Model endpoint unreachable | Inline error in prompt bar with endpoint URL + link to settings |
| Workspace folder creation fails | Error state with path + OS error message |

---

## Tech Stack

- **Electron 30** — desktop shell
- **Vite 5** — bundler for renderer
- **React 18** — renderer UI
- **Monaco Editor** — VS Code's editor component, syntax highlighting + streaming
- **Zustand** — renderer state
- **openai npm SDK** — OpenAI-compatible client (works against any local server)
- **electron-store** — persistent settings
- **Tailwind CSS** — styling
- **TypeScript** — throughout

---

## Out of Scope (v1)

- Live browser preview / running the generated code
- Multi-file editing or agent follow-up after generation
- Git init on generated projects
- Session history / project browser
