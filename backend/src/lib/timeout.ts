import { TimeoutError } from "@/lib/errors";

// Caps a single Gemini call so a slow upstream returns a friendly 504 instead
// of hanging until the platform kills the function (backend-spec §4.5).
export async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(label)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
