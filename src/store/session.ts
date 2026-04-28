import { create } from 'zustand'
import type { FileStatus } from '../../electron/types'

export type Phase = 'idle' | 'clarifying' | 'planning' | 'streaming' | 'done' | 'error'

export interface Question {
  question: string
  options: string[]
  selected: string | null
}

export interface FileState {
  filename: string
  description: string
  language: string
  status: FileStatus
}

export interface ActiveStream {
  filename: string
  content: string
  language: string
}

const INITIAL = {
  phase: 'idle' as Phase,
  prompt: '',
  questions: [] as Question[],
  filePlan: [] as FileState[],
  activeStream: null as ActiveStream | null,
  workspacePath: null as string | null,
  error: null as string | null,
}

interface SessionState {
  phase: Phase
  prompt: string
  questions: Question[]
  filePlan: FileState[]
  activeStream: ActiveStream | null
  workspacePath: string | null
  error: string | null
}

interface SessionStore extends SessionState {
  setPhase: (phase: Phase) => void
  setPrompt: (prompt: string) => void
  setQuestions: (questions: Question[]) => void
  answerQuestion: (index: number, answer: string) => void
  setFilePlan: (plan: FileState[]) => void
  updateFileStatus: (filename: string, status: FileStatus) => void
  setActiveStream: (stream: ActiveStream | null) => void
  appendToken: (token: string) => void
  setWorkspacePath: (path: string) => void
  setError: (error: string) => void
  reset: () => void
  getInitialState: () => SessionState
}

export const useSessionStore = create<SessionStore>((set) => ({
  ...INITIAL,

  setPhase: (phase) => set({ phase }),
  setPrompt: (prompt) => set({ prompt }),
  setQuestions: (questions) => set({ questions }),
  answerQuestion: (index, answer) =>
    set((s) => ({
      questions: s.questions.map((q, i) => (i === index ? { ...q, selected: answer } : q)),
    })),
  setFilePlan: (filePlan) => set({ filePlan }),
  updateFileStatus: (filename, status) =>
    set((s) => ({
      filePlan: s.filePlan.map((f) => (f.filename === filename ? { ...f, status } : f)),
    })),
  setActiveStream: (activeStream) => set({ activeStream }),
  appendToken: (token) =>
    set((s) =>
      s.activeStream
        ? { activeStream: { ...s.activeStream, content: s.activeStream.content + token } }
        : s
    ),
  setWorkspacePath: (workspacePath) => set({ workspacePath }),
  setError: (error) => set({ phase: 'error', error }),
  reset: () => set({ ...INITIAL }),
  getInitialState: () => ({ ...INITIAL }),
}))
