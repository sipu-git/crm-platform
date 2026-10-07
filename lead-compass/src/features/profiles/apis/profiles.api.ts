import { api } from "@/api/client";
import type { ApiSuccess, DeleteProfilePayload, Profile, UpdateProfilePayload } from "../types";
const endpoint = "/profile";

export const profilesApi = {
  async get(): Promise<Profile> {
    return (await api.get<ApiSuccess<Profile>>(endpoint)).data.data;
  },
  async update(value: UpdateProfilePayload): Promise<Profile> {
    return (await api.patch<ApiSuccess<Profile>>(endpoint, value)).data.data;
  },
  async delete(value: DeleteProfilePayload): Promise<{ deleted: true }> {
    return (await api.delete<ApiSuccess<{ deleted: true }>>(endpoint, { data: value })).data.data;
  },
  async uploadUserProfilePicture(file: File): Promise<{ profilePic: string; imageUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return (await api.post<ApiSuccess<{ profilePic: string; imageUrl: string }>>(`${endpoint}/user-picture`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })).data.data;
  },
  async uploadTenantLogo(file: File): Promise<{ logo_url: string; logoUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return (await api.post<ApiSuccess<{ logo_url: string; logoUrl: string }>>(`${endpoint}/tenant-logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })).data.data;
  },
  async uploadPicture(file: File) {
    return this.uploadUserProfilePicture(file);
  },
  async uploadLogo(file: File) {
    return this.uploadTenantLogo(file);
  },
};
