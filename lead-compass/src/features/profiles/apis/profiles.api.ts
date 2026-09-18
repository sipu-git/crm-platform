import { api } from "@/api/client";
import type { ApiSuccess, DeleteProfilePayload, Profile, UpdateProfilePayload } from "../types";
const endpoint = "/profile";
export const profilesApi = {
  async get(): Promise<Profile> { return (await api.get<ApiSuccess<Profile>>(endpoint)).data.data; },
  async update(value: UpdateProfilePayload): Promise<Profile> { return (await api.patch<ApiSuccess<Profile>>(endpoint, value)).data.data; },
  async delete(value: DeleteProfilePayload): Promise<{ deleted: true }> { return (await api.delete<ApiSuccess<{ deleted: true }>>(endpoint, { data: value })).data.data; },
};
