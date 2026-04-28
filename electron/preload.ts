import { contextBridge, ipcRenderer } from 'electron'

const api = {
  submitPrompt: (payload: { prompt: string; answers: string[] }) =>
    ipcRenderer.invoke('agent:submit', payload),

  onClarify: (cb: (data: { questions: { question: string; options: string[] }[] }) => void) => {
    ipcRenderer.on('agent:clarify', (_, data) => cb(data))
  },
  onPlan: (cb: (data: { files: { filename: string; description: string; language: string }[]; workspacePath: string }) => void) => {
    ipcRenderer.on('agent:plan', (_, data) => cb(data))
  },
  onFileStart: (cb: (data: { filename: string; language: string }) => void) => {
    ipcRenderer.on('agent:file-start', (_, data) => cb(data))
  },
  onToken: (cb: (data: { token: string }) => void) => {
    ipcRenderer.on('agent:token', (_, data) => cb(data))
  },
  onFileComplete: (cb: (data: { filename: string }) => void) => {
    ipcRenderer.on('agent:file-complete', (_, data) => cb(data))
  },
  onFileError: (cb: (data: { filename: string; error: string }) => void) => {
    ipcRenderer.on('agent:file-error', (_, data) => cb(data))
  },
  onDone: (cb: (data: { workspacePath: string }) => void) => {
    ipcRenderer.on('agent:done', (_, data) => cb(data))
  },

  onAgentError: (cb: (data: { error: string }) => void) => {
    ipcRenderer.on('agent:error', (_, data) => cb(data))
  },

  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (s: unknown) => ipcRenderer.invoke('settings:save', s),
  openInVSCode: (p: string) => ipcRenderer.invoke('workspace:open-vscode', p),
  openInExplorer: (p: string) => ipcRenderer.invoke('workspace:open-explorer', p),
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
}

contextBridge.exposeInMainWorld('electron', api)

export type ElectronAPI = typeof api
