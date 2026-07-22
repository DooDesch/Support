// Tiny in-memory TTL cache for server-side loaders. Single-instance only (the
// app runs as one standalone container); a fresh deploy starts empty.
type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();

// Returns the cached value for `key` while fresh, otherwise runs `loader`.
// If the loader fails and a stale value exists, the stale value is served so
// a GitHub outage degrades to slightly old data instead of an error.
export async function cached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const entry = store.get(key) as Entry<T> | undefined;
  if (entry && entry.expiresAt > now) return entry.value;

  try {
    const value = await loader();
    store.set(key, { value, expiresAt: now + ttlMs });
    return value;
  } catch (error) {
    if (entry) {
      console.error(`Cache loader for "${key}" failed, serving stale:`, error);
      return entry.value;
    }
    throw error;
  }
}
