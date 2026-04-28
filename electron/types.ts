export interface Settings {
  workspaceDir: string
  modelEndpoint: string
  modelName: string
  apiKey: string
  openInVSCode: boolean
}

export interface AgentQuestion {
  question: string
  options: string[]
}

export interface FilePlanEntry {
  filename: string
  description: string
  language: string
}

export type FileStatus = 'pending' | 'writing' | 'done' | 'failed'
