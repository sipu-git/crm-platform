import { api } from "@/api/client";
import { Company, CompanyListMeta, CompanyListResponse, CreateCompany, OwnCompanyUser, UpdateCompany } from "../types/companies.types";

type Wrapped<T> = T | { data: T };
const unwrap = <T,>(data: Wrapped<T>) => (typeof data === "object" && data !== null && "data" in data ? (data as { data: T }).data : data as T);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function isCompanyListMeta(value: unknown): value is CompanyListMeta {
  return isRecord(value)
    && typeof value.total === "number"
    && typeof value.page === "number"
    && typeof value.limit === "number"
    && typeof value.totalPages === "number"
    && typeof value.hasNextPage === "boolean"
    && typeof value.hasPrevPage === "boolean";
}

function parseCompanyListResponse(payload: unknown): CompanyListResponse {
  if (Array.isArray(payload)) return { data: payload as Company[] };
  if (!isRecord(payload)) throw new Error("Invalid companies list response");

  // The API currently returns { success, message, data: { data: Company[], meta } }.
  // Accept the unwrapped paginated and legacy array forms as well.
  const result = payload.data;
  if (isRecord(result) && Array.isArray(result.data)) {
    return {
      data: result.data as Company[],
      meta: isCompanyListMeta(result.meta) ? result.meta : undefined,
    };
  }

  if (Array.isArray(result)) {
    return {
      data: result as Company[],
      meta: isCompanyListMeta(payload.meta) ? payload.meta : undefined,
    };
  }

  throw new Error("Invalid companies list response");
}

const sub_url = "/companies";

export const companiesApi = {
  async list(): Promise<CompanyListResponse> { return parseCompanyListResponse((await api.get<unknown>(`${sub_url}/view-company-list`)).data); },
  async getById(id: string): Promise<Company> { return unwrap((await api.get<Wrapped<Company>>(`${sub_url}/${id}`)).data); },
  async getOwn(): Promise<Company> { return unwrap((await api.get<Wrapped<OwnCompanyUser>>(`${sub_url}/view-own-company`)).data).company; },
  async updateOwn(value: UpdateCompany): Promise<Company> { return unwrap((await api.patch<Wrapped<{ company: Company }>>(`${sub_url}/modify-company`, value)).data).company; },
  async create(value: CreateCompany): Promise<Company> { return unwrap((await api.post<Wrapped<Company>>("/companies", value)).data); },
  async update(id: string, value: UpdateCompany): Promise<Company> { return unwrap((await api.patch<Wrapped<Company>>(`${sub_url}/${id}`, value)).data); },
  async delete(id: string): Promise<void> { await api.delete(`/companies/${id}`); },
};
