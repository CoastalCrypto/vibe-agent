import Store from 'electron-store'
import path from 'path'
import os from 'os'
import type { Settings } from './types'

const store = new Store<Settings>()

const DEFAULTS: Settings = {
  workspaceDir: path.join(os.homedir(), 'vibe-projects'),
  modelEndpoint: 'http://localhost:11434/v1',
  modelName: 'qwen2.5-coder:7b',
  apiKey: '',
  openInVSCode: true,
}

export function getSettings(): Settings {
  return {
    workspaceDir: store.get('workspaceDir', DEFAULTS.workspaceDir),
    modelEndpoint: store.get('modelEndpoint', DEFAULTS.modelEndpoint),
    modelName: store.get('modelName', DEFAULTS.modelName),
    apiKey: store.get('apiKey', DEFAULTS.apiKey),
    openInVSCode: store.get('openInVSCode', DEFAULTS.openInVSCode),
  }
}

export function saveSettings(settings: Settings): void {
  store.set('workspaceDir', settings.workspaceDir)
  store.set('modelEndpoint', settings.modelEndpoint)
  store.set('modelName', settings.modelName)
  store.set('apiKey', settings.apiKey)
  store.set('openInVSCode', settings.openInVSCode)
}
