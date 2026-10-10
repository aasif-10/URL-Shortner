// In-memory click counter (Write-Behind Cache pattern)
// Accumulates click counts per URL ID in memory.
// A background job periodically flushes these to PostgreSQL in bulk,
// avoiding a DB write on every single redirect request.

const clickCounters = new Map();

/**
 * Increments the in-memory click counter for a given URL ID.
 * @param {string} urlId
 */
export function incrementClickCounter(urlId) {
  const current = clickCounters.get(urlId) || 0;
  clickCounters.set(urlId, current + 1);
}

/**
 * Atomically drains and returns all pending click counters.
 * Clears the map so that new increments start fresh after the flush.
 * @returns {Map<string, number>}
 */
export function drainClickCounters() {
  const snapshot = new Map(clickCounters);
  clickCounters.clear();
  return snapshot;
}

/**
 * Returns the total number of pending (unflushed) click events.
 * @returns {number}
 */
export function getPendingClickCount() {
  let total = 0;
  for (const count of clickCounters.values()) total += count;
  return total;
}
