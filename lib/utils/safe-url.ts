export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}
