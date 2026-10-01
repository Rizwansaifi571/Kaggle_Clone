const rateLimits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  let record = rateLimits.get(key);

  if (!record || record.resetAt < now) {
    record = { count: 0, resetAt: now + windowMs };
  }

  record.count += 1;
  rateLimits.set(key, record);

  return record.count <= limit;
}
