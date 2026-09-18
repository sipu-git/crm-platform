import { Role, TeamUser } from '@/features/users/types';
import {
  Shield,
  Briefcase,
  User,
  DollarSign,
  Handshake,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import React from 'react';

// Role style mappings
export const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800',
  MANAGER: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  SALES_REP: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  FINANCE: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  CLIENT: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
};
export const DEFAULT_ROLE_STYLE = 'bg-primary/10 text-primary border-primary/20';

export const ROLE_RING: Record<string, string> = {
  ADMIN: 'ring-violet-400/60',
  MANAGER: 'ring-blue-400/60',
  SALES_REP: 'ring-emerald-400/60',
  FINANCE: 'ring-amber-400/60',
  CLIENT: 'ring-slate-400/60',
};
export const DEFAULT_ROLE_RING = 'ring-primary/40';

export const ROLE_DOT: Record<string, string> = {
  ADMIN: 'bg-violet-500',
  MANAGER: 'bg-blue-500',
  SALES_REP: 'bg-emerald-500',
  FINANCE: 'bg-amber-500',
  CLIENT: 'bg-slate-500',
};
export const DEFAULT_ROLE_DOT = 'bg-primary';

export const AVATAR_STYLES = [
  'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
];

export function initials(name: string) {
  return (name || '')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function avatarStyle(name: string) {
  const hash = (name || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_STYLES[hash % AVATAR_STYLES.length];
}

export const ROLE_ICONS: Record<string, React.ReactNode> = {
  ADMIN: <Shield className="h-3.5 w-3.5 mr-1 shrink-0" />,
  MANAGER: <Briefcase className="h-3.5 w-3.5 mr-1 shrink-0" />,
  SALES_REP: <User className="h-3.5 w-3.5 mr-1 shrink-0" />,
  FINANCE: <DollarSign className="h-3.5 w-3.5 mr-1 shrink-0" />,
  CLIENT: <Handshake className="h-3.5 w-3.5 mr-1 shrink-0" />,
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  SALES_REP: 'Sales Rep',
  FINANCE: 'Finance',
  CLIENT: 'Client',
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
        ROLE_STYLES[role] ?? DEFAULT_ROLE_STYLE
      }`}
    >
      {ROLE_ICONS[role]}
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

export const STATUS_STYLES: Record<string, string> = {
  ACCEPTED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  EXPIRED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  REVOKED: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
};

export const STATUS_ICONS: Record<string, React.ReactNode> = {
  ACCEPTED: <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500 shrink-0" />,
  PENDING: <Clock className="h-3 w-3 mr-1 text-amber-500 shrink-0" />,
  EXPIRED: <AlertCircle className="h-3 w-3 mr-1 text-rose-500 shrink-0" />,
  REVOKED: <XCircle className="h-3 w-3 mr-1 text-slate-500 shrink-0" />,
};

export const STATUS_LABELS: Record<string, string> = {
  ACCEPTED: 'Active',
  PENDING: 'Pending',
  EXPIRED: 'Expired',
  REVOKED: 'Revoked',
};

export function StatusBadge({ status }: { status?: string }) {
  const st = (status ?? 'ACCEPTED').toUpperCase();
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${
        STATUS_STYLES[st] ?? STATUS_STYLES.ACCEPTED
      }`}
    >
      {STATUS_ICONS[st] ?? STATUS_ICONS.ACCEPTED}
      {STATUS_LABELS[st] ?? st.toLowerCase()}
    </span>
  );
}

export type SortField = 'name' | 'role';
export type SortDir = 'asc' | 'desc';

export function SortButton({
  field,
  label,
  sortField,
  sortDir,
  onSort,
}: {
  field: SortField;
  label: string;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const isActive = sortField === field;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      {isActive ? (
        sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-30" />
      )}
    </button>
  );
}
