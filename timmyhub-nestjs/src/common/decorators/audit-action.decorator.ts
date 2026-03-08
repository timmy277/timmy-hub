import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'audit_action';

export interface AuditActionOptions {
    action: string;
}

export const AuditAction = (action: string) =>
    SetMetadata(AUDIT_ACTION_KEY, { action } as AuditActionOptions);
