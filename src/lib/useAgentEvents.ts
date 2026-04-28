import { useEffect } from 'react'
import { useSessionStore } from '../store/session'
import type { FileState } from '../store/session'

export function useAgentEvents(): void {
  const store = useSessionStore()

  useEffect(() => {
    const { electron } = window

    electron.onClarify(({ questions }) => {
      store.setQuestions(questions.map((q) => ({ ...q, selected: null })))
      store.setPhase('clarifying')
    })

    electron.onPlan(({ files, workspacePath }) => {
      store.setFilePlan(files.map((f): FileState => ({ ...f, status: 'pending' })))
      store.setWorkspacePath(workspacePath)
      store.setPhase('streaming')
    })

    electron.onFileStart(({ filename, language }) => {
      store.updateFileStatus(filename, 'writing')
      store.setActiveStream({ filename, content: '', language })
    })

    electron.onToken(({ token }) => store.appendToken(token))
    electron.onFileComplete(({ filename }) => store.updateFileStatus(filename, 'done'))
    electron.onFileError(({ filename }) => store.updateFileStatus(filename, 'failed'))
    electron.onDone(({ workspacePath }) => {
      store.setWorkspacePath(workspacePath)
      store.setPhase('done')
    })
    electron.onAgentError(({ error }) => store.setError(error))

    return () => {
      ;['agent:clarify', 'agent:plan', 'agent:file-start', 'agent:token',
        'agent:file-complete', 'agent:file-error', 'agent:done', 'agent:error',
      ].forEach((ch) => electron.removeAllListeners(ch))
    }
  }, [])
}
