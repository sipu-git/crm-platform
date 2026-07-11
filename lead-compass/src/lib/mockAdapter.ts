// Custom axios adapter that pattern-matches URLs against the mock DB.
// Works both in the browser and during SSR (returns empty payloads on server).

import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from "axios";
import { DEAL_STAGES, getDb, newId, persist } from "./mockDb";
import type {
  Deal,
  DealStage,
  Invoice,
  InvoiceStatus,
  Lead,
  LeadStatus,
  Notification,
  Tenant,
  User,
} from "./mockDb";

const LATENCY = 250;

function ok<T>(config: AxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: "OK",
    headers: {},
    config: config as AxiosResponse["config"],
  };
}
function fail(config: AxiosRequestConfig, status: number, message: string): never {
  const err = new Error(message) as Error & { response?: AxiosResponse; isAxiosError?: boolean };
  err.isAxiosError = true;
  err.response = {
    data: { message },
    status,
    statusText: message,
    headers: {},
    config: config as AxiosResponse["config"],
  };
  throw err;
}

function tenantIdFromSlug(slug: string): string | null {
  const t = getDb().tenants.find((x) => x.slug === slug);
  return t ? t.id : null;
}

function parseBody<T>(data: unknown): T {
  if (!data) return {} as T;
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as T;
    } catch {
      return {} as T;
    }
  }
  return data as T;
}

interface Route {
  method: string;
  pattern: RegExp;
  handle: (
    m: RegExpMatchArray,
    config: AxiosRequestConfig,
  ) => AxiosResponse | Promise<AxiosResponse>;
}

const routes: Route[] = [
  // Auth
  {
    method: "POST",
    pattern: /^\/auth\/login$/,
    handle: (_m, cfg) => {
      const body = parseBody<{ email: string; password: string }>(cfg.data);
      const user = getDb().users.find((u) => u.email === body.email);
      if (!user || body.password !== "demo") return fail(cfg, 401, "Invalid credentials");
      const tenants = getDb().tenants.filter((t) => user.tenantIds.includes(t.id));
      const token = `mock.${user.id}.${Date.now()}`;
      return ok(cfg, { token, user, tenants });
    },
  },
  {
    method: "GET",
    pattern: /^\/me$/,
    handle: (_m, cfg) => {
      // Return first user for simplicity; token isn't decoded in the mock.
      const user = getDb().users[0];
      const tenants = getDb().tenants.filter((t) => user.tenantIds.includes(t.id));
      return ok(cfg, { user, tenants });
    },
  },

  // Dashboard KPIs
  {
    method: "GET",
    pattern: /^\/([^/]+)\/dashboard$/,
    handle: (m, cfg) => {
      const tid = tenantIdFromSlug(m[1]);
      if (!tid) return fail(cfg, 404, "Tenant not found");
      const db = getDb();
      const deals = db.deals.filter((d) => d.tenantId === tid);
      const invoices = db.invoices.filter((i) => i.tenantId === tid);
      const openDeals = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
      const pipelineValue = openDeals.reduce((s, d) => s + d.amount, 0);
      const overdue = invoices.filter((i) => i.status === "overdue");
      const byStage = DEAL_STAGES.map((stage) => ({
        stage,
        count: deals.filter((d) => d.stage === stage).length,
        value: deals.filter((d) => d.stage === stage).reduce((s, d) => s + d.amount, 0),
      }));
      // Revenue trend (last 6 months synthetic from won deals)
      const trend = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return {
          month: d.toLocaleString("en", { month: "short" }),
          revenue: 15000 + ((i * 4231) % 30000),
        };
      });
      const activity = db.activities
        .filter((a) => a.tenantId === tid)
        .slice(0, 8);
      return ok(cfg, {
        kpis: {
          openDeals: openDeals.length,
          pipelineValue,
          overdueInvoices: overdue.length,
          totalLeads: db.leads.filter((l) => l.tenantId === tid).length,
        },
        byStage,
        trend,
        activity,
      });
    },
  },

  // Leads
  {
    method: "GET",
    pattern: /^\/([^/]+)\/leads$/,
    handle: (m, cfg) => {
      const tid = tenantIdFromSlug(m[1]);
      if (!tid) return fail(cfg, 404, "Tenant not found");
      return ok(cfg, getDb().leads.filter((l) => l.tenantId === tid));
    },
  },
  {
    method: "POST",
    pattern: /^\/([^/]+)\/leads$/,
    handle: (m, cfg) => {
      const tid = tenantIdFromSlug(m[1]);
      if (!tid) return fail(cfg, 404, "Tenant not found");
      const body = parseBody<Partial<Lead>>(cfg.data);
      const lead: Lead = {
        id: newId(),
        tenantId: tid,
        name: body.name || "Untitled",
        email: body.email || "",
        company: body.company || "",
        phone: body.phone,
        source: body.source || "web",
        status: (body.status as LeadStatus) || "new",
        assignedTo: body.assignedTo,
        notes: body.notes,
        createdAt: new Date().toISOString(),
      };
      getDb().leads.unshift(lead);
      persist();
      return ok(cfg, lead, 201);
    },
  },
  {
    method: "PATCH",
    pattern: /^\/([^/]+)\/leads\/([^/]+)$/,
    handle: (m, cfg) => {
      const body = parseBody<Partial<Lead>>(cfg.data);
      const idx = getDb().leads.findIndex((l) => l.id === m[2]);
      if (idx === -1) return fail(cfg, 404, "Lead not found");
      getDb().leads[idx] = { ...getDb().leads[idx], ...body };
      persist();
      return ok(cfg, getDb().leads[idx]);
    },
  },
  {
    method: "DELETE",
    pattern: /^\/([^/]+)\/leads\/([^/]+)$/,
    handle: (m, cfg) => {
      const db = getDb();
      db.leads = db.leads.filter((l) => l.id !== m[2]);
      persist();
      return ok(cfg, { ok: true });
    },
  },
  {
    method: "POST",
    pattern: /^\/([^/]+)\/leads\/bulk$/,
    handle: (m, cfg) => {
      const body = parseBody<{ action: "delete" | "assign"; ids: string[]; assignedTo?: string }>(
        cfg.data,
      );
      const db = getDb();
      if (body.action === "delete") {
        db.leads = db.leads.filter((l) => !body.ids.includes(l.id));
      } else if (body.action === "assign" && body.assignedTo) {
        db.leads = db.leads.map((l) =>
          body.ids.includes(l.id) ? { ...l, assignedTo: body.assignedTo } : l,
        );
      }
      persist();
      return ok(cfg, { ok: true });
    },
  },

  // Deals
  {
    method: "GET",
    pattern: /^\/([^/]+)\/deals$/,
    handle: (m, cfg) => {
      const tid = tenantIdFromSlug(m[1]);
      if (!tid) return fail(cfg, 404, "Tenant not found");
      return ok(cfg, getDb().deals.filter((d) => d.tenantId === tid));
    },
  },
  {
    method: "POST",
    pattern: /^\/([^/]+)\/deals$/,
    handle: (m, cfg) => {
      const tid = tenantIdFromSlug(m[1]);
      if (!tid) return fail(cfg, 404, "Tenant not found");
      const body = parseBody<Partial<Deal>>(cfg.data);
      const deal: Deal = {
        id: newId(),
        tenantId: tid,
        title: body.title || "Untitled",
        company: body.company || "",
        amount: body.amount ?? 0,
        stage: (body.stage as DealStage) || "lead",
        ownerId: body.ownerId,
        closeDate: body.closeDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      getDb().deals.unshift(deal);
      persist();
      return ok(cfg, deal, 201);
    },
  },
  {
    method: "PATCH",
    pattern: /^\/([^/]+)\/deals\/([^/]+)$/,
    handle: (m, cfg) => {
      const body = parseBody<Partial<Deal>>(cfg.data);
      const idx = getDb().deals.findIndex((d) => d.id === m[2]);
      if (idx === -1) return fail(cfg, 404, "Deal not found");
      // Simulate occasional server rejection to demonstrate rollback:
      // if stage change is happening and the client passes { failNext: true } in headers
      if (cfg.headers && (cfg.headers as Record<string, unknown>)["x-simulate-failure"]) {
        return fail(cfg, 500, "Simulated failure");
      }
      getDb().deals[idx] = { ...getDb().deals[idx], ...body };
      persist();
      return ok(cfg, getDb().deals[idx]);
    },
  },
  {
    method: "DELETE",
    pattern: /^\/([^/]+)\/deals\/([^/]+)$/,
    handle: (m, cfg) => {
      const db = getDb();
      db.deals = db.deals.filter((d) => d.id !== m[2]);
      persist();
      return ok(cfg, { ok: true });
    },
  },

  // Invoices
  {
    method: "GET",
    pattern: /^\/([^/]+)\/invoices$/,
    handle: (m, cfg) => {
      const tid = tenantIdFromSlug(m[1]);
      if (!tid) return fail(cfg, 404, "Tenant not found");
      return ok(cfg, getDb().invoices.filter((i) => i.tenantId === tid));
    },
  },
  {
    method: "POST",
    pattern: /^\/([^/]+)\/invoices$/,
    handle: (m, cfg) => {
      const tid = tenantIdFromSlug(m[1]);
      if (!tid) return fail(cfg, 404, "Tenant not found");
      const body = parseBody<Partial<Invoice>>(cfg.data);
      const inv: Invoice = {
        id: newId(),
        tenantId: tid,
        number: body.number || `INV-${Math.floor(Math.random() * 9000) + 1000}`,
        clientName: body.clientName || "",
        clientEmail: body.clientEmail || "",
        issueDate: body.issueDate || new Date().toISOString(),
        dueDate: body.dueDate || new Date().toISOString(),
        status: (body.status as InvoiceStatus) || "draft",
        lines: body.lines || [],
        notes: body.notes,
      };
      getDb().invoices.unshift(inv);
      persist();
      return ok(cfg, inv, 201);
    },
  },
  {
    method: "PATCH",
    pattern: /^\/([^/]+)\/invoices\/([^/]+)$/,
    handle: (m, cfg) => {
      const body = parseBody<Partial<Invoice>>(cfg.data);
      const idx = getDb().invoices.findIndex((i) => i.id === m[2]);
      if (idx === -1) return fail(cfg, 404, "Invoice not found");
      getDb().invoices[idx] = { ...getDb().invoices[idx], ...body };
      persist();
      return ok(cfg, getDb().invoices[idx]);
    },
  },
  {
    method: "DELETE",
    pattern: /^\/([^/]+)\/invoices\/([^/]+)$/,
    handle: (m, cfg) => {
      const db = getDb();
      db.invoices = db.invoices.filter((i) => i.id !== m[2]);
      persist();
      return ok(cfg, { ok: true });
    },
  },

  // Notifications
  {
    method: "GET",
    pattern: /^\/([^/]+)\/notifications$/,
    handle: (m, cfg) => {
      const tid = tenantIdFromSlug(m[1]);
      if (!tid) return fail(cfg, 404, "Tenant not found");
      return ok(cfg, getDb().notifications.filter((n) => n.tenantId === tid));
    },
  },
  {
    method: "PATCH",
    pattern: /^\/([^/]+)\/notifications\/([^/]+)\/read$/,
    handle: (m, cfg) => {
      const n = getDb().notifications.find((x) => x.id === m[2]);
      if (!n) return fail(cfg, 404, "Not found");
      n.read = true;
      persist();
      return ok(cfg, n);
    },
  },
  {
    method: "POST",
    pattern: /^\/([^/]+)\/notifications\/read-all$/,
    handle: (m, cfg) => {
      const tid = tenantIdFromSlug(m[1]);
      if (!tid) return fail(cfg, 404, "Tenant not found");
      getDb().notifications.forEach((n) => {
        if (n.tenantId === tid) n.read = true;
      });
      persist();
      return ok(cfg, { ok: true });
    },
  },

  // Users & tenant admin
  {
    method: "GET",
    pattern: /^\/([^/]+)\/users$/,
    handle: (m, cfg) => {
      const tid = tenantIdFromSlug(m[1]);
      if (!tid) return fail(cfg, 404, "Tenant not found");
      return ok(cfg, getDb().users.filter((u) => u.tenantIds.includes(tid)));
    },
  },
  {
    method: "PATCH",
    pattern: /^\/([^/]+)\/users\/([^/]+)$/,
    handle: (m, cfg) => {
      const body = parseBody<Partial<User>>(cfg.data);
      const u = getDb().users.find((x) => x.id === m[2]);
      if (!u) return fail(cfg, 404, "User not found");
      Object.assign(u, body);
      persist();
      return ok(cfg, u);
    },
  },
  {
    method: "PATCH",
    pattern: /^\/tenants\/([^/]+)$/,
    handle: (m, cfg) => {
      const body = parseBody<Partial<Tenant>>(cfg.data);
      const t = getDb().tenants.find((x) => x.id === m[1] || x.slug === m[1]);
      if (!t) return fail(cfg, 404, "Tenant not found");
      Object.assign(t, body);
      persist();
      return ok(cfg, t);
    },
  },
  {
    method: "PATCH",
    pattern: /^\/me$/,
    handle: (cfg) => {
      const body = parseBody<Partial<User>>(cfg.input as unknown);
      const u = getDb().users[0];
      Object.assign(u, body);
      persist();
      return ok(cfg as unknown as AxiosRequestConfig, u);
    },
  },
];

export const mockAdapter: AxiosAdapter = async (config) => {
  const url = (config.url || "").replace(/^\/api/, "");
  const method = (config.method || "get").toUpperCase();
  await new Promise((r) => setTimeout(r, LATENCY));

  for (const r of routes) {
    if (r.method !== method) continue;
    const match = url.match(r.pattern);
    if (match) return r.handle(match, config);
  }
  return fail(config, 404, `No mock route for ${method} ${url}`);
};
