import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { shell } from 'electron'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function createWorkspace(baseDir: string, prompt: string): Promise<string> {
  const name = `${slugify(prompt)}-${today()}`
  const workspacePath = path.join(baseDir, name)
  fs.mkdirSync(workspacePath, { recursive: true })
  return workspacePath
}

export async function writeFile(workspacePath: string, filename: string, content: string): Promise<void> {
  const fullPath = path.join(workspacePath, filename)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content, 'utf8')
}

export function openInVSCode(workspacePath: string): void {
  exec(`code "${workspacePath}"`)
}

export function openInExplorer(workspacePath: string): void {
  shell.openPath(workspacePath)
}
