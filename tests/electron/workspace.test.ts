import { describe, it, expect, vi, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'

vi.mock('electron', () => ({
  shell: { openPath: vi.fn() },
}))

describe('workspace', () => {
  const base = path.join(os.tmpdir(), 'vibe-test-' + Date.now())
  afterEach(() => fs.rmSync(base, { recursive: true, force: true }))

  it('creates folder with slugified name and date', async () => {
    const { createWorkspace } = await import('../../electron/workspace')
    const p = await createWorkspace(base, 'Build a Discord Bot for crypto')
    expect(fs.existsSync(p)).toBe(true)
    expect(path.basename(p)).toMatch(/^build-a-discord-bot-for-crypto-\d{4}-\d{2}-\d{2}$/)
  })

  it('writes nested files creating parent dirs', async () => {
    const { createWorkspace, writeFile } = await import('../../electron/workspace')
    const ws = await createWorkspace(base, 'Test project')
    await writeFile(ws, 'commands/price.js', 'module.exports = {}')
    const content = fs.readFileSync(path.join(ws, 'commands/price.js'), 'utf8')
    expect(content).toBe('module.exports = {}')
  })
})
