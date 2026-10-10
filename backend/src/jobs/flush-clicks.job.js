import { prisma } from '../config/db.config.js';
import { logger } from '../config/logger.config.js';
import { drainClickCounters, getPendingClickCount } from '../utils/click-counter.util.js';

// Flush interval: every 30 seconds
const FLUSH_INTERVAL_MS = 30 * 1000;

/**
 * Drains the in-memory click counters and bulk-updates PostgreSQL.
 * Uses Promise.all to run all updates concurrently.
 */
export async function flushClicksToDB() {
  const pending = getPendingClickCount();
  if (pending === 0) return;

  const counters = drainClickCounters();

  logger.info(`[ClickFlushJob] Flushing ${counters.size} URLs (${pending} total clicks) to DB`);

  const updates = Array.from(counters.entries()).map(([urlId, count]) =>
    prisma.url.update({
      where: { id: urlId },
      data: { clicks: { increment: count } },
    })
  );

  try {
    await Promise.all(updates);
    logger.info(`[ClickFlushJob] Successfully flushed ${counters.size} URL click counters`);
  } catch (err) {
    logger.error({ err }, '[ClickFlushJob] Failed to flush click counters to DB');
    // Re-add failed counts back so they are not lost
    for (const [urlId, count] of counters.entries()) {
      const { incrementClickCounter } = await import('../utils/click-counter.util.js');
      for (let i = 0; i < count; i++) incrementClickCounter(urlId);
    }
  }
}

/**
 * Starts the background click flush cron job.
 * Returns the interval handle so it can be cleared on graceful shutdown.
 * @returns {NodeJS.Timeout}
 */
export function startClickFlushJob() {
  logger.info(`[ClickFlushJob] Started — flushing every ${FLUSH_INTERVAL_MS / 1000}s`);
  return setInterval(flushClicksToDB, FLUSH_INTERVAL_MS);
}
