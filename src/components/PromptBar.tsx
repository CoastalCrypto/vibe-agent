import { useState } from 'react'
import { useSessionStore } from '../store/session'

interface Props {
  onOpenSettings: () => void
}

export function PromptBar({ onOpenSettings }: Props) {
  const [input, setInput] = useState('')
  const { phase, setPrompt, setPhase } = useSessionStore()
  const isIdle = phase === 'idle' || phase === 'done' || phase === 'error'

  function handleSubmit() {
    const trimmed = input.trim()
    if (!trimmed || !isIdle) return
    setPrompt(trimmed)
    setPhase('clarifying')
    window.electron.submitPrompt({ prompt: trimmed, answers: [] })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#0a0a18] border-b border-[#1e1e3a]">
      <span className="text-indigo-500 text-sm flex-shrink-0">▸</span>
      <input
        className="flex-1 bg-[#12121e] border border-indigo-900 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 disabled:opacity-50"
        placeholder="Describe what you want to build..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={!isIdle}
      />
      <button
        onClick={handleSubmit}
        disabled={!isIdle || !input.trim()}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm rounded-md px-4 py-2 transition-colors flex-shrink-0"
      >
        Send ↵
      </button>
      <button
        onClick={onOpenSettings}
        className="text-slate-500 hover:text-slate-300 text-sm px-2 transition-colors"
        title="Settings"
      >
        ⚙
      </button>
    </div>
  )
}
