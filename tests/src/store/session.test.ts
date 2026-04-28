import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useSessionStore } from '../../../src/store/session'

describe('useSessionStore', () => {
  beforeEach(() => useSessionStore.setState(useSessionStore.getState().getInitialState() as any))

  it('starts in idle phase', () => {
    expect(useSessionStore.getState().phase).toBe('idle')
  })

  it('setPhase updates phase', () => {
    act(() => useSessionStore.getState().setPhase('clarifying'))
    expect(useSessionStore.getState().phase).toBe('clarifying')
  })

  it('answerQuestion updates selected', () => {
    act(() => useSessionStore.getState().setQuestions([
      { question: 'Lang?', options: ['Node', 'Python'], selected: null },
    ]))
    act(() => useSessionStore.getState().answerQuestion(0, 'Node'))
    expect(useSessionStore.getState().questions[0].selected).toBe('Node')
  })

  it('updateFileStatus changes status by filename', () => {
    act(() => useSessionStore.getState().setFilePlan([
      { filename: 'index.js', description: '', language: 'js', status: 'pending' },
    ]))
    act(() => useSessionStore.getState().updateFileStatus('index.js', 'writing'))
    expect(useSessionStore.getState().filePlan[0].status).toBe('writing')
  })

  it('appendToken adds to activeStream content', () => {
    act(() => useSessionStore.getState().setActiveStream({ filename: 'f.js', content: 'x', language: 'js' }))
    act(() => useSessionStore.getState().appendToken('y'))
    expect(useSessionStore.getState().activeStream?.content).toBe('xy')
  })

  it('reset returns to idle with empty state', () => {
    act(() => useSessionStore.getState().setPhase('done'))
    act(() => useSessionStore.getState().reset())
    expect(useSessionStore.getState().phase).toBe('idle')
    expect(useSessionStore.getState().filePlan).toHaveLength(0)
  })
})
