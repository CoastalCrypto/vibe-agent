import { useSessionStore } from '../store/session'
import type { FileState } from '../store/session'

const STATUS_ICON: Record<FileState['status'], string> = {
  pending: '⟳',
  writing: '●',
  done: '✓',
  failed: '✗',
}

const STATUS_CLASS: Record<FileState['status'], string> = {
  pending: 'text-amber-500 opacity-50',
  writing: 'text-cyan-400 animate-pulse',
  done: 'text-green-400',
  failed: 'text-red-400',
}

export function FileTreePanel() {
  const { filePlan, workspacePath } = useSessionStore()
  const dirName = workspacePath?.split(/[\\/]/).pop()

  return (
    <div className="flex flex-col p-3 h-full overflow-y-auto">
      <div className="text-cyan-400 text-[10px] uppercase tracking-widest mb-3">
        Files{filePlan.length > 0 && <span className="text-slate-500 ml-1">{filePlan.length} planned</span>}
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {filePlan.map((f) => (
          <div
            key={f.filename}
            className={`flex items-center gap-2 text-[11px] ${
              f.status === 'writing' ? 'bg-[#0f1729] rounded px-2 py-1 border-l-2 border-cyan-400' : ''
            }`}
          >
            <span className={`text-[10px] flex-shrink-0 ${STATUS_CLASS[f.status]}`}>
              {STATUS_ICON[f.status]}
            </span>
            <span className={f.status === 'writing' ? 'text-slate-100' : 'text-slate-400'}>
              {f.filename}
            </span>
          </div>
        ))}
      </div>

      {dirName && (
        <div className="mt-3 pt-2 border-t border-[#1e1e3a]">
          <div className="text-slate-600 text-[9px] uppercase mb-1">Workspace</div>
          <div className="text-slate-500 text-[9px] leading-relaxed break-all">{dirName}</div>
        </div>
      )}
    </div>
  )
}
