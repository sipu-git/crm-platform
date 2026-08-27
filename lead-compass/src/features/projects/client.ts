import { AnyActionArg } from "react";
import { ApiSuccess, PaginatedResponse, Project } from "./types";
import { api } from "@/api/client";

const BASE_URL = "/api/projects";

export const projectApi = {
    create(payload: any) {
        return api.post<ApiSuccess<Project>>(BASE_URL, payload)
            .then((res) => res.data.data);
    },

    convertLead(payload: any) {
        return api.post<ApiSuccess<Project>>(`${BASE_URL}/convert-lead`, payload)
            .then((res) => res.data.data);
    },

    getById(id: string) {
        return api.get<ApiSuccess<Project>>(`${BASE_URL}/${id}`)
            .then((res) => res.data.data);
    },

    list(params: any) {
        return api.get<PaginatedResponse<Project>>(BASE_URL, { params })
            .then((res) => res.data);
    },

    update(id: string, payload: any) {
        return api.patch<ApiSuccess<Project>>(`${BASE_URL}/${id}`, payload)
            .then((res) => res.data.data);
    },
};