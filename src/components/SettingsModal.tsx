import { useState, useEffect } from 'react'
import type { Settings } from '../../electron/types'

interface Props {
  open: boolean
  onClose: () => void
}

const DEFAULTS: Settings = {
  workspaceDir: '',
  modelEndpoint: 'http://localhost:11434/v1',
  modelName: 'qwen2.5-coder:7b',
  apiKey: '',
  openInVSCode: true,
}

const FIELDS = [
  { label: 'Model Endpoint', key: 'modelEndpoint', placeholder: 'http://localhost:11434/v1' },
  { label: 'Model Name', key: 'modelName', placeholder: 'qwen2.5-coder:7b' },
  { label: 'API Key', key: 'apiKey', placeholder: 'optional' },
  { label: 'Workspace Directory', key: 'workspaceDir', placeholder: '~/vibe-projects' },
] as const

export function SettingsModal({ open, onClose }: Props) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) window.electron.getSettings().then((s: Settings) => setSettings(s))
  }, [open])

  async function handleSave() {
    setSaving(true)
    await window.electron.saveSettings(settings)
    setSaving(false)
    onClose()
  }

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#12121e] border border-[#2a2a3e] rounded-xl p-6 w-[480px] shadow-2xl">
        <h2 className="text-slate-200 text-base font-medium mb-5">Settings</h2>

        <div className="flex flex-col gap-4">
          {FIELDS.map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-slate-400 text-xs mb-1 block">{label}</label>
              <input
                className="w-full bg-[#0a0a14] border border-[#2a2a3e] rounded-md px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
                value={String(settings[key])}
                placeholder={placeholder}
                type={key === 'apiKey' ? 'password' : 'text'}
                onChange={(e) => update(key, e.target.value as any)}
              />
            </div>
          ))}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.openInVSCode}
              onChange={(e) => update('openInVSCode', e.target.checked)}
              className="accent-indigo-500"
            />
            <span className="text-slate-400 text-sm">Open in VS Code when done</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm px-4 py-2">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-md px-4 py-2"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
