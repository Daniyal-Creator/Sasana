// Single-line JSON to stdout/stderr; Vercel captures these as structured,
// searchable logs (backend-spec §4.6). Log context, never content: no message
// text, no image bytes, no keys.

type LogFields = Record<string, unknown>;

function emit(write: (line: string) => void, level: "info" | "error", fields: LogFields): void {
  const clean: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) clean[key] = value;
  }
  write(JSON.stringify({ level, ts: new Date().toISOString(), ...clean }));
}

export function logInfo(fields: LogFields): void {
  emit((line) => console.log(line), "info", fields);
}

export function logError(fields: LogFields): void {
  emit((line) => console.error(line), "error", fields);
}
