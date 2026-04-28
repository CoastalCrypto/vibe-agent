// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FileTreePanel } from '../../../src/components/FileTreePanel'
import { useSessionStore } from '../../../src/store/session'

describe('FileTreePanel', () => {
  it('renders file list with correct filenames', () => {
    useSessionStore.setState({
      filePlan: [
        { filename: 'index.js', description: '', language: 'js', status: 'done' },
        { filename: 'utils/crypto.js', description: '', language: 'js', status: 'writing' },
        { filename: 'README.md', description: '', language: 'md', status: 'pending' },
      ],
      workspacePath: '/home/user/vibe-projects/my-app',
    } as any)
    render(<FileTreePanel />)
    expect(screen.getByText('index.js')).toBeInTheDocument()
    expect(screen.getByText('utils/crypto.js')).toBeInTheDocument()
    expect(screen.getByText('README.md')).toBeInTheDocument()
  })
})
