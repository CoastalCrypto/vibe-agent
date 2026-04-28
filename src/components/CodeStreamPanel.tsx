import { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { useSessionStore } from '../store/session'
import type { editor as MonacoEditor } from 'monaco-editor'

export function CodeStreamPanel() {
  const { activeStream, filePlan, phase } = useSessionStore()
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (editorRef.current && activeStream) {
      const model = editorRef.current.getModel()
      if (model) editorRef.current.revealLine(model.getLineCount())
    }
  }, [activeStream?.content])

  const doneCount = filePlan.filter((f) => f.status === 'done').length
  const failedCount = filePlan.filter((f) => f.status === 'failed').length
  const pendingCount = filePlan.filter((f) => f.status === 'pending').length

  return (
    <div className="flex flex-col h-full bg-[#0a0a14]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e3a]">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-[10px] uppercase tracking-widest">
            {activeStream?.filename ?? 'Code Stream'}
          </span>
          {phase === 'streaming' && activeStream && (
            <span className="bg-[#0f2918] text-green-400 text-[9px] px-2 py-0.5 rounded-full border border-green-900">
              ● streaming
            </span>
          )}
        </div>
        <span className="text-slate-600 text-[9px]">{activeStream?.language ?? ''}</span>
      </div>

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={activeStream?.language ?? 'plaintext'}
          value={activeStream?.content ?? ''}
          theme="vs-dark"
          onMount={(editor) => { editorRef.current = editor }}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            fontFamily: "'Cascadia Code', 'Fira Code', monospace",
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>

      {filePlan.length > 0 && (
        <div className="flex items-center gap-4 px-3 py-1.5 bg-[#080810] border-t border-[#1e1e3a] text-[10px]">
          {doneCount > 0 && <span className="text-green-400">● {doneCount} complete</span>}
          {phase === 'streaming' && <span className="text-cyan-400">● 1 streaming</span>}
          {pendingCount > 0 && <span className="text-slate-500">{pendingCount} pending</span>}
          {failedCount > 0 && <span className="text-red-400">✗ {failedCount} failed</span>}
        </div>
      )}
    </div>
  )
}
