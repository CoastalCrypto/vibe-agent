import { useState } from 'react'
import { PromptBar } from './components/PromptBar'
import { QAPanel } from './components/QAPanel'
import { FileTreePanel } from './components/FileTreePanel'
import { CodeStreamPanel } from './components/CodeStreamPanel'
import { SettingsModal } from './components/SettingsModal'
import { useAgentEvents } from './lib/useAgentEvents'
import { useSessionStore } from './store/session'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { phase, workspacePath, reset } = useSessionStore()
  useAgentEvents()

  return (
    <div className="flex flex-col h-screen bg-[#0d0d14] text-slate-200 select-none">

      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#080810] border-b border-[#1e1e3a]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_#6366f1]" />
          <span className="text-indigo-400 text-[11px] tracking-[3px] uppercase">Vibe Agent</span>
        </div>
        <span className="text-green-400 text-[10px]">● localhost connected</span>
      </div>

      {/* Prompt bar */}
      <PromptBar onOpenSettings={() => setSettingsOpen(true)} />

      {/* Three-panel Command Center */}
      <div className="flex-1 overflow-hidden grid" style={{ gridTemplateColumns: '240px 180px 1fr' }}>
        <div className="border-r border-[#1e1e3a] overflow-hidden"><QAPanel /></div>
        <div className="border-r border-[#1e1e3a] overflow-hidden"><FileTreePanel /></div>
        <div className="overflow-hidden"><CodeStreamPanel /></div>
      </div>

      {/* Session complete banner */}
      {phase === 'done' && workspacePath && (
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a1a0a] border-t border-green-900">
          <span className="text-green-400 text-sm">
            ✓ Project ready — {workspacePath.split(/[\\/]/).pop()}
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => window.electron.openInExplorer(workspacePath)}
              className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              Open folder
            </button>
            <button
              onClick={() => window.electron.openInVSCode(workspacePath)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-md px-3 py-1"
            >
              Open in VS Code
            </button>
            <button onClick={reset} className="text-slate-500 hover:text-slate-300 text-sm">
              New session
            </button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {phase === 'error' && (
        <div className="flex items-center justify-between px-4 py-3 bg-[#1a0a0a] border-t border-red-900">
          <span className="text-red-400 text-sm">
            Something went wrong. Check your model endpoint in settings.
          </span>
          <button onClick={reset} className="text-slate-400 hover:text-slate-200 text-sm">
            Try again
          </button>
        </div>
      )}

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
