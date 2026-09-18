import { api } from "@/api/client";
import type { ApiSuccess, CreateProjectPayload, ConvertLeadToProjectPayload, ListProjectsParams, PaginatedResponse, Project, UpdateProjectPayload } from "../types/projects.types";

// The Axios client already has the /api base URL; keep this endpoint relative.
const endpoint = "/project";
export const projectsApi = {
  async list(filters: ListProjectsParams = {}): Promise<PaginatedResponse<Project>> { return (await api.get<PaginatedResponse<Project>>(`${endpoint}/project-all`, { params: filters })).data; },
  async own(filters: ListProjectsParams = {}): Promise<PaginatedResponse<Project>> { return (await api.get<PaginatedResponse<Project>>(`${endpoint}/view-own-project`, { params: filters })).data; },
  async getById(id: string): Promise<Project | null> {
    const res = await api.get<ApiSuccess<Project>>(`${endpoint}/${id}`);
    return res.data.data ?? null;
  }, 
  async getClientProject(id: string): Promise<Project | null> {
    const res = await api.get<ApiSuccess<Project[]>>(`${endpoint}/view-own-project/${id}`);
    const project = res.data.data[0];
    return project ?? null;
  }, 
 async convertLead(value: ConvertLeadToProjectPayload): Promise<Project> { return (await api.post<ApiSuccess<Project>>(`${endpoint}/convert-lead`, value)).data.data; },
  async update(id: string, value: UpdateProjectPayload): Promise<Project> { return (await api.patch<ApiSuccess<Project>>(`${endpoint}/${id}`, value)).data.data; },
};
