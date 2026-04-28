import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockHandle = vi.fn()
vi.mock('electron', () => ({
  ipcMain: { handle: mockHandle },
  BrowserWindow: vi.fn(),
}))
vi.mock('../../electron/agent/session', () => ({ runAgentSession: vi.fn() }))
vi.mock('../../electron/settings', () => ({ getSettings: vi.fn(), saveSettings: vi.fn() }))
vi.mock('../../electron/workspace', () => ({
  openInVSCode: vi.fn(),
  openInExplorer: vi.fn(),
}))

describe('registerIpcHandlers', () => {
  beforeEach(() => vi.clearAllMocks())

  it('registers all 5 expected IPC channels', async () => {
    const mockWin = { webContents: { send: vi.fn() } } as any
    const { registerIpcHandlers } = await import('../../electron/ipc')
    registerIpcHandlers(mockWin)
    const channels = mockHandle.mock.calls.map(([ch]: [string]) => ch)
    expect(channels).toContain('agent:submit')
    expect(channels).toContain('settings:get')
    expect(channels).toContain('settings:save')
    expect(channels).toContain('workspace:open-vscode')
    expect(channels).toContain('workspace:open-explorer')
    expect(channels).toHaveLength(5)
  })
})
