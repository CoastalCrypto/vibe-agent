// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PromptBar } from '../../../src/components/PromptBar'
import { useSessionStore } from '../../../src/store/session'

vi.stubGlobal('electron', { submitPrompt: vi.fn() })

describe('PromptBar', () => {
  beforeEach(() => {
    useSessionStore.setState({ phase: 'idle', prompt: '' } as any)
    vi.clearAllMocks()
  })

  it('send button is disabled when input is empty', () => {
    render(<PromptBar onOpenSettings={vi.fn()} />)
    expect(screen.getByText(/Send/)).toBeDisabled()
  })

  it('send button enabled once text is entered', () => {
    render(<PromptBar onOpenSettings={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText(/Describe/), { target: { value: 'build a bot' } })
    expect(screen.getByText(/Send/)).not.toBeDisabled()
  })

  it('submits prompt via IPC with empty answers on button click', () => {
    render(<PromptBar onOpenSettings={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText(/Describe/), { target: { value: 'build a bot' } })
    fireEvent.click(screen.getByText(/Send/))
    expect(window.electron.submitPrompt).toHaveBeenCalledWith({ prompt: 'build a bot', answers: [] })
  })

  it('input and button are disabled when phase is streaming', () => {
    useSessionStore.setState({ phase: 'streaming' } as any)
    render(<PromptBar onOpenSettings={vi.fn()} />)
    expect(screen.getByPlaceholderText(/Describe/)).toBeDisabled()
    expect(screen.getByText(/Send/)).toBeDisabled()
  })

  it('calls onOpenSettings when settings button clicked', () => {
    const onOpen = vi.fn()
    render(<PromptBar onOpenSettings={onOpen} />)
    fireEvent.click(screen.getByTitle('Settings'))
    expect(onOpen).toHaveBeenCalledOnce()
  })
})
