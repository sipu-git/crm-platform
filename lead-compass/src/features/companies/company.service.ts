import { api } from "@/api/client";

const subUrl = "/companies";

export const companyApis = {
  create: (data: any) => api.post(subUrl, data),
  list: () => api.get(`${subUrl}/view-company-list`),
  getById: (id: string) => api.get(`${subUrl}/${id}`),
  getOwnCompany: () => api.get(`${subUrl}/view-own-company`),
  update: (id: string, data: any) => api.patch(`${subUrl}/${id}`, data),
  modifyOwnCompany: (data: any) => api.patch(`${subUrl}/modify-company`, data),
  uploadLogo: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`${subUrl}/${id}/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadOwnLogo: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`${subUrl}/upload-logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  remove: (id: string) => api.delete(`${subUrl}/${id}`),
};
