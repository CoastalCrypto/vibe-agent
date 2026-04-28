import { ipcMain, BrowserWindow } from 'electron'
import { runAgentSession } from './agent/session'
import { getSettings, saveSettings } from './settings'
import { openInVSCode, openInExplorer } from './workspace'

export function registerIpcHandlers(win: BrowserWindow): void {
  ipcMain.handle('agent:submit', (_, payload) => runAgentSession(win, payload))
  ipcMain.handle('settings:get', () => getSettings())
  ipcMain.handle('settings:save', (_, settings) => saveSettings(settings))
  ipcMain.handle('workspace:open-vscode', (_, p: string) => openInVSCode(p))
  ipcMain.handle('workspace:open-explorer', (_, p: string) => openInExplorer(p))
}
