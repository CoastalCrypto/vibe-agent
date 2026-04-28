// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QAPanel } from '../../../src/components/QAPanel'
import { useSessionStore } from '../../../src/store/session'

vi.stubGlobal('electron', { submitPrompt: vi.fn(), removeAllListeners: vi.fn() })

const twoQuestions = [
  { question: 'Which language?', options: ['Node.js', 'Python'], selected: null },
  { question: 'Which coins?', options: ['BTC/ETH', 'Configurable'], selected: null },
]

describe('QAPanel', () => {
  beforeEach(() => {
    useSessionStore.setState({ phase: 'clarifying', questions: twoQuestions, prompt: 'build a bot' } as any)
    vi.clearAllMocks()
  })

  it('renders all questions and options', () => {
    render(<QAPanel />)
    expect(screen.getByText('Which language?')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.getByText('Configurable')).toBeInTheDocument()
  })

  it('clicking option marks it selected in store', () => {
    render(<QAPanel />)
    fireEvent.click(screen.getByText('Node.js'))
    expect(useSessionStore.getState().questions[0].selected).toBe('Node.js')
  })

  it('"Start coding" is disabled until all questions answered', () => {
    render(<QAPanel />)
    expect(screen.getByText(/Start coding/)).toBeDisabled()
    fireEvent.click(screen.getByText('Node.js'))
    fireEvent.click(screen.getByText('BTC/ETH'))
    expect(screen.getByText(/Start coding/)).not.toBeDisabled()
  })

  it('"Start coding" submits answers via IPC', () => {
    render(<QAPanel />)
    fireEvent.click(screen.getByText('Node.js'))
    fireEvent.click(screen.getByText('BTC/ETH'))
    fireEvent.click(screen.getByText(/Start coding/))
    expect(window.electron.submitPrompt).toHaveBeenCalledWith({
      prompt: 'build a bot',
      answers: ['Node.js', 'BTC/ETH'],
    })
  })
})
