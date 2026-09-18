import { api } from "@/api/client";
import { SearchParams, SearchResult } from "./types";

const subUrl = "/shared"
export const searchApi = {
    search({ query, types, limit, signal, ...filters }: SearchParams) {
        const params: Record<string, string | number> = {};

        if (query) params.q = query;
        if (types && types.length) params.type = types.join(",");
        if (limit) params.limit = limit;

        // pass through the specific filters as-is (names already match backend)
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });

        return api.get<{ data: SearchResult }>(`${subUrl}/search`, { params, signal });
    },
};