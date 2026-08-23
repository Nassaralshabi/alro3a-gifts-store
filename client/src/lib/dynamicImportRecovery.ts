const STALE_CHUNK_RETRY_KEY = "alrawaa:stale-chunk-retry";
const RETRY_COOLDOWN_MS = 5 * 60_000;

export function isStaleDynamicImportError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /failed to fetch dynamically imported module|importing a module script failed|loading chunk [^\s]+ failed/i.test(message);
}

export function reserveStaleChunkRetry(storage: Pick<Storage, "getItem" | "setItem">, now = Date.now()) {
  const previous = Number(storage.getItem(STALE_CHUNK_RETRY_KEY) || 0);
  if (Number.isFinite(previous) && previous > 0 && now - previous < RETRY_COOLDOWN_MS) return false;
  storage.setItem(STALE_CHUNK_RETRY_KEY, String(now));
  return true;
}
