import Audit from '@/models/Audit';

export class AuditService {
  async log(orgId: string, actorEmail: string, action: string, payload: any = {}) {
    await (Audit as any).create({ orgId, actorEmail, action, payload });
  }
}
