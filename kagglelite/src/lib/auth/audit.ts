import db from '@/lib/db';

export function logAudit(userId: number | null, event: string, ip: string = '', userAgent: string = '', metadata: any = {}) {
  try {
    db.prepare('INSERT INTO audit_logs (user_id, event, ip, user_agent, metadata_json) VALUES (?, ?, ?, ?, ?)')
      .run(userId, event, ip, userAgent, JSON.stringify(metadata));
  } catch (e) {
    console.error('Failed to log audit event', e);
  }
}
