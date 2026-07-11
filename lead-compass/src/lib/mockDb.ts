// In-memory + localStorage-persisted mock database for the CRM.
// Seeded on first load. Every write persists so a page refresh keeps state.

export type ID = string;

export interface Tenant {
  id: ID;
  slug: string;
  name: string;
  logoUrl?: string;
  primaryColor: string;
}

export interface User {
  id: ID;
  email: string;
  name: string;
  role: "admin" | "manager" | "rep";
  tenantIds: ID[];
  avatarUrl?: string;
}

export type LeadStatus = "new" | "contacted" | "qualified" | "unqualified";
export interface Lead {
  id: ID;
  tenantId: ID;
  name: string;
  email: string;
  company: string;
  phone?: string;
  source: "web" | "referral" | "outbound" | "event";
  status: LeadStatus;
  assignedTo?: ID;
  createdAt: string;
  notes?: string;
}

export const DEAL_STAGES = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export interface Deal {
  id: ID;
  tenantId: ID;
  title: string;
  company: string;
  amount: number;
  stage: DealStage;
  ownerId?: ID;
  closeDate: string;
  createdAt: string;
}

export interface InvoiceLine {
  id: ID;
  description: string;
  quantity: number;
  unitPrice: number;
}
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export interface Invoice {
  id: ID;
  tenantId: ID;
  number: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  notes?: string;
}

export interface Notification {
  id: ID;
  tenantId: ID;
  userId: ID;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface Activity {
  id: ID;
  tenantId: ID;
  kind: "lead" | "deal" | "invoice" | "note";
  message: string;
  createdAt: string;
}

interface DB {
  users: User[];
  tenants: Tenant[];
  leads: Lead[];
  deals: Deal[];
  invoices: Invoice[];
  notifications: Notification[];
  activities: Activity[];
}

const KEY = "crm.mock.db.v1";
const uid = () => Math.random().toString(36).slice(2, 10);
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => iso(new Date(Date.now() - n * 86400_000));
const daysAhead = (n: number) => iso(new Date(Date.now() + n * 86400_000));

function seed(): DB {
  const tenants: Tenant[] = [
    { id: "t_acme", slug: "acme", name: "Acme Corp", primaryColor: "#4F46E5" },
    { id: "t_globex", slug: "globex", name: "Globex Ltd", primaryColor: "#10B981" },
  ];
  const users: User[] = [
    {
      id: "u_1",
      email: "demo@crm.app",
      name: "Alex Morgan",
      role: "admin",
      tenantIds: ["t_acme", "t_globex"],
    },
    {
      id: "u_2",
      email: "sam@crm.app",
      name: "Sam Rivera",
      role: "manager",
      tenantIds: ["t_acme"],
    },
    {
      id: "u_3",
      email: "jordan@crm.app",
      name: "Jordan Lee",
      role: "rep",
      tenantIds: ["t_acme", "t_globex"],
    },
  ];

  const companies = [
    "Northwind",
    "Contoso",
    "Initech",
    "Umbrella",
    "Stark Industries",
    "Wayne Enterprises",
    "Wonka",
    "Hooli",
    "Pied Piper",
    "Massive Dynamic",
  ];
  const first = ["Ava", "Liam", "Noah", "Mia", "Ethan", "Zoe", "Owen", "Lily", "Ryan", "Nora"];
  const last = ["Chen", "Patel", "Kim", "Garcia", "Smith", "Nguyen", "Brown", "Davis", "Lopez", "Cohen"];
  const sources: Lead["source"][] = ["web", "referral", "outbound", "event"];
  const statuses: LeadStatus[] = ["new", "contacted", "qualified", "unqualified"];

  const leads: Lead[] = [];
  const deals: Deal[] = [];
  for (const t of tenants) {
    for (let i = 0; i < 24; i++) {
      const fn = first[i % first.length];
      const ln = last[(i * 3) % last.length];
      const c = companies[i % companies.length];
      leads.push({
        id: uid(),
        tenantId: t.id,
        name: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${c.toLowerCase()}.com`,
        company: c,
        phone: `+1 555-01${(10 + i).toString().padStart(2, "0")}`,
        source: sources[i % sources.length],
        status: statuses[i % statuses.length],
        assignedTo: users[(i % 2) + 1].id,
        createdAt: daysAgo(i),
      });
    }
    for (let i = 0; i < 18; i++) {
      const stage = DEAL_STAGES[i % DEAL_STAGES.length];
      deals.push({
        id: uid(),
        tenantId: t.id,
        title: `${companies[i % companies.length]} — ${["Platform", "Add-on", "Renewal", "Expansion"][i % 4]}`,
        company: companies[i % companies.length],
        amount: 5000 + ((i * 1373) % 90000),
        stage,
        ownerId: users[(i % 2) + 1].id,
        closeDate: daysAhead(((i * 7) % 60) - 10),
        createdAt: daysAgo((i * 3) % 40),
      });
    }
  }

  const invoices: Invoice[] = [];
  for (const t of tenants) {
    for (let i = 0; i < 12; i++) {
      const st: InvoiceStatus = (["draft", "sent", "paid", "overdue"] as const)[i % 4];
      const qty = 1 + (i % 4);
      const price = 250 + ((i * 173) % 1200);
      invoices.push({
        id: uid(),
        tenantId: t.id,
        number: `INV-${(1000 + i).toString()}`,
        clientName: companies[i % companies.length],
        clientEmail: `billing@${companies[i % companies.length].toLowerCase()}.com`,
        issueDate: daysAgo(30 - i),
        dueDate: daysAhead(15 - i),
        status: st,
        lines: [
          { id: uid(), description: "Platform subscription", quantity: qty, unitPrice: price },
          { id: uid(), description: "Onboarding services", quantity: 1, unitPrice: 500 },
        ],
      });
    }
  }

  const notifications: Notification[] = [];
  for (const t of tenants) {
    for (let i = 0; i < 6; i++) {
      notifications.push({
        id: uid(),
        tenantId: t.id,
        userId: "u_1",
        title: ["New lead assigned", "Deal moved to Won", "Invoice overdue", "Reminder"][i % 4],
        body: "Auto-generated activity in your workspace.",
        createdAt: daysAgo(i),
        read: i > 2,
      });
    }
  }
  const activities: Activity[] = [];
  for (const t of tenants) {
    for (let i = 0; i < 10; i++) {
      activities.push({
        id: uid(),
        tenantId: t.id,
        kind: (["lead", "deal", "invoice", "note"] as const)[i % 4],
        message: [
          "Lead created from web form",
          "Deal advanced to Proposal",
          "Invoice sent",
          "Note added to contact",
        ][i % 4],
        createdAt: daysAgo(i),
      });
    }
  }

  return { users, tenants, leads, deals, invoices, notifications, activities };
}

let cache: DB | null = null;
function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getDb(): DB {
  if (cache) return cache;
  if (isBrowser()) {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        cache = JSON.parse(raw) as DB;
        return cache;
      } catch {
        /* fallthrough */
      }
    }
  }
  cache = seed();
  persist();
  return cache;
}

export function persist() {
  if (!cache || !isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(cache));
}

export function resetDb() {
  cache = seed();
  persist();
}

export function newId() {
  return uid();
}
