import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activitiesApi } from "../apis/activities.api";
import { activitiesKeys } from "../keys/activities.keys";
import type {
    CreateActivityInput,
    ListActivitiesQuery,
    UpdateActivityInput,
} from "../types";

const cache = {
    staleTime: 1000 * 60,
    // refetchInterval: 10000,
    // refetchIntervalInBackground: true,
};

export function useActivities(filters?: ListActivitiesQuery, enabled = true) {
    return useQuery({
        queryKey: filters ? activitiesKeys.list(filters) : activitiesKeys.lists(),
        queryFn: () => activitiesApi.list(filters),
        enabled,
        ...cache,
    });
}

export function useOwnActivities(enabled = true) {
    return useQuery({
        queryKey: activitiesKeys.own(),
        queryFn: () => activitiesApi.getOwnActivity(),
        enabled,
        ...cache,
    });
}

export function useActivityMutation() {
    const qc = useQueryClient();

    const refresh = () =>
        Promise.all([
            qc.invalidateQueries({ queryKey: activitiesKeys.lists() }),
            qc.invalidateQueries({ queryKey: activitiesKeys.own() }),
        ]);

    const patch = (activity: { id: string }) =>
        qc.setQueryData(activitiesKeys.detail(activity.id), activity);

    return {
        create: useMutation({
            mutationFn: (value: CreateActivityInput) => activitiesApi.create(value),
            onSuccess: (activity) => {
                patch(activity);
                return refresh();
            },
        }),

        update: useMutation({
            mutationFn: ({ id, value }: { id: string; value: UpdateActivityInput }) =>
                activitiesApi.update(id, value),
            onSuccess: (activity) => {
                patch(activity);
                return refresh();
            },
        }),

        complete: useMutation({
            mutationFn: activitiesApi.complete,
            onSuccess: (activity) => {
                patch(activity);
                return refresh();
            },
        }),

        delete: useMutation({
            mutationFn: activitiesApi.delete,
            onSuccess: (_, id) => {
                qc.removeQueries({ queryKey: activitiesKeys.detail(id) });
                return refresh();
            },
        }),
    };
}