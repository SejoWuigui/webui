import { AuditEvent, AuditService } from 'app/enums/audit.enum';
import { ApiTimestamp } from 'app/interfaces/api-date.interface';
import { MiddlewareAuditEntry } from 'app/interfaces/audit/middleware-audit-entry.interface';
import { SmbAuditEntry } from 'app/interfaces/audit/smb-audit-entry.interface';
import { SudoAuditEntry } from 'app/interfaces/audit/sudo-audit-entry.interface';
import { SystemAuditEntry } from 'app/interfaces/audit/system-audit-entry.interface';
import { ApiQueryParams } from 'app/modules/ix-table/classes/api-data-provider/query-params';

export interface AuditQueryParams extends ApiQueryParams<AuditEntry> {
  services?: AuditService[];
  remote_controller?: boolean;
}

export interface BaseAuditEntry {
  audit_id: string;
  session: string;
  message_timestamp: number;
  timestamp: ApiTimestamp;
  address: string;
  username: string;
  event: AuditEvent;
  success: boolean;
}

export interface AuditConfig {
  retention: number;
  reservation: number;
  quota: number;
  quota_fill_warning: number;
  quota_fill_critical: number;
}

export type AuditEntry = SmbAuditEntry | MiddlewareAuditEntry | SudoAuditEntry | SystemAuditEntry;

export interface AuditVersions {
  major: number;
  minor: number;
}
