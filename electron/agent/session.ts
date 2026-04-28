import { BrowserWindow } from 'electron'
import { runClarify } from './clarify'
import { runPlan } from './plan'
import { runStream } from './stream'
import { createWorkspace, writeFile } from '../workspace'
import { getSettings } from '../settings'

export interface SubmitPayload {
  prompt: string
  answers: string[]
}

export async function runAgentSession(win: BrowserWindow, payload: SubmitPayload): Promise<void> {
  const settings = getSettings()
  const { prompt, answers } = payload

  try {
    if (answers.length === 0) {
      const questions = await runClarify(settings, prompt)
      win.webContents.send('agent:clarify', { questions })
      return
    }

    const filePlan = await runPlan(settings, prompt, answers)
    const workspacePath = await createWorkspace(settings.workspaceDir, prompt)
    win.webContents.send('agent:plan', { files: filePlan, workspacePath })

    for (const file of filePlan) {
      win.webContents.send('agent:file-start', { filename: file.filename, language: file.language })
      const tokens: string[] = []
      try {
        await runStream(settings, prompt, answers, filePlan, file, (token) => {
          tokens.push(token)
          win.webContents.send('agent:token', { token })
        })
        await writeFile(workspacePath, file.filename, tokens.join(''))
        win.webContents.send('agent:file-complete', { filename: file.filename })
      } catch (err) {
        win.webContents.send('agent:file-error', { filename: file.filename, error: String(err) })
      }
    }

    win.webContents.send('agent:done', { workspacePath })
  } catch (err) {
    win.webContents.send('agent:error', { error: String(err) })
  }
}
