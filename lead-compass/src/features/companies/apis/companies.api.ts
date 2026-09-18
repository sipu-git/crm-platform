import { api } from "@/api/client";
import { Company, CreateCompany, OwnCompanyUser, UpdateCompany } from "../types/companies.types";

type Wrapped<T> = T | { data: T };
const unwrap = <T,>(data: Wrapped<T>) => (typeof data === "object" && data !== null && "data" in data ? (data as { data: T }).data : data as T);

const sub_url = "/companies";

export const companiesApi = {
  async list(): Promise<Company[]> { return unwrap((await api.get<Wrapped<Company[]>>(`${sub_url}/view-company-list`)).data); },
  async getById(id: string): Promise<Company> { return unwrap((await api.get<Wrapped<Company>>(`${sub_url}/${id}`)).data); },
  async getOwn(): Promise<Company> { return unwrap((await api.get<Wrapped<OwnCompanyUser>>(`${sub_url}/view-own-company`)).data).company; },
  async updateOwn(value: UpdateCompany): Promise<Company> { return unwrap((await api.patch<Wrapped<{ company: Company }>>(`${sub_url}/modify-company`, value)).data).company; },
  async create(value: CreateCompany): Promise<Company> { return unwrap((await api.post<Wrapped<Company>>("/companies", value)).data); },
  async update(id: string, value: UpdateCompany): Promise<Company> { return unwrap((await api.patch<Wrapped<Company>>(`${sub_url}/${id}`, value)).data); },
  async delete(id: string): Promise<void> { await api.delete(`/companies/${id}`); },
};