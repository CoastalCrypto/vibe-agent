export function stripFences(raw: string): string {
  return raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
}
