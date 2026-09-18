import { api } from '@/api/client';
import { AuditLog } from '@/features/audit/types';

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  const { data } = await api.get<AuditLog[]>('/audit');
  return data;
};

