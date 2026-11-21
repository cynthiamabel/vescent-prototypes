export function cleanSharpenText(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sharpenDisplayTitle(
  primary: string | null | undefined,
  fallback = "Sharpen",
): string {
  const cleaned = cleanSharpenText(primary);
  return cleaned || fallback;
}
