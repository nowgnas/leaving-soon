const RETENTION_HOURS = 24;

export function buildCleanupCutoff(now = new Date()): Date {
  return new Date(now.getTime() - RETENTION_HOURS * 60 * 60 * 1000);
}

