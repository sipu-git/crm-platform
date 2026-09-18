import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '@/features/audit/api/audit.api';
import { AuditLog } from '@/features/audit/types';

export const useAuditLogs = () => {
  return useQuery<AuditLog[], Error>({
    queryKey: ['audit', 'logs'],
    queryFn: fetchAuditLogs,
    staleTime: 5 * 60_000,
  });
};

