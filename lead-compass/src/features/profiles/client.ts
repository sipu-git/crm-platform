import { api } from "@/api/client";
import { Profile, UpdateProfilePayload, DeleteProfilePayload, ApiSuccess } from "./types";

const BASE_URL = "/profile";

export const profileApi = {
    get() {
        return api.get<ApiSuccess<Profile>>(BASE_URL);
    },

    update(payload: UpdateProfilePayload) {
        return api.patch<ApiSuccess<Profile>>(BASE_URL, payload)
    },

    remove(payload: DeleteProfilePayload) {
        return api.delete<ApiSuccess<{ deleted: true }>>(BASE_URL, { data: payload })
    },
};