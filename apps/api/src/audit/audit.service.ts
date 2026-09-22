import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';

export type AuditInput = { actorId: string; action: string; targetId: string; requestId: string };

@Injectable()
export class AuditService {
  async record(tx: Prisma.TransactionClient, event: AuditInput): Promise<void> {
    // Explicit allowlist: never persist arbitrary request bodies or credentials.
    const { actorId, action, targetId, requestId } = event;
    await tx.auditEvent.create({ data: { actorId, action, targetId, requestId } });
  }
}
