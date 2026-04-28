// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { useAgentEvents } from '../../../src/lib/useAgentEvents'
import { useSessionStore } from '../../../src/store/session'

const listeners: Record<string, (data: any) => void> = {}
const removeAllListeners = vi.fn()

vi.stubGlobal('electron', {
  onClarify: (cb: any) => { listeners['clarify'] = cb },
  onPlan: (cb: any) => { listeners['plan'] = cb },
  onFileStart: (cb: any) => { listeners['file-start'] = cb },
  onToken: (cb: any) => { listeners['token'] = cb },
  onFileComplete: (cb: any) => { listeners['file-complete'] = cb },
  onFileError: (cb: any) => { listeners['file-error'] = cb },
  onDone: (cb: any) => { listeners['done'] = cb },
  onAgentError: (cb: any) => { listeners['error'] = cb },
  removeAllListeners,
})

describe('useAgentEvents', () => {
  beforeEach(() => {
    useSessionStore.setState(useSessionStore.getState().getInitialState() as any)
    vi.clearAllMocks()
  })

  it('sets phase to clarifying and populates questions on clarify event', () => {
    renderHook(() => useAgentEvents())
    act(() => listeners['clarify']({ questions: [{ question: 'Lang?', options: ['Node'] }] }))
    expect(useSessionStore.getState().phase).toBe('clarifying')
    expect(useSessionStore.getState().questions).toHaveLength(1)
    expect(useSessionStore.getState().questions[0].selected).toBeNull()
  })

  it('sets phase to streaming and populates file plan on plan event', () => {
    renderHook(() => useAgentEvents())
    act(() => listeners['plan']({
      files: [{ filename: 'f.js', description: '', language: 'js' }],
      workspacePath: '/tmp/ws',
    }))
    expect(useSessionStore.getState().phase).toBe('streaming')
    expect(useSessionStore.getState().filePlan[0].status).toBe('pending')
    expect(useSessionStore.getState().workspacePath).toBe('/tmp/ws')
  })

  it('removes all 8 listeners on unmount', () => {
    const { unmount } = renderHook(() => useAgentEvents())
    unmount()
    expect(removeAllListeners).toHaveBeenCalledTimes(8)
  })
})
