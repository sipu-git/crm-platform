import { api } from "@/api/client";

const subUrl = "/companies";

export const companyApis = {
  create: (data: any) => api.post(subUrl, data),
  list: () => api.get(`${subUrl}/view-company-list`),
  getById: (id: string) => api.get(`${subUrl}/${id}`),
  update: (id: string, data: any) => api.patch(`${subUrl}/${id}`, data),
  remove: (id: string) => api.delete(`${subUrl}/${id}`),
};
