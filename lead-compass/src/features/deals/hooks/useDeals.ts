import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dealsApi } from "../apis/deals.api";
import { dealsKeys } from "../keys/deals.keys";
import type {
    DealFilters,
    MoveDealStageInput,
    UpdateDealInput,
} from "../deal.types";

const cache = {
    staleTime: 1000 * 60,
    // refetchInterval: 10000,
    // refetchIntervalInBackground: true,
};

export function useDeals(filters?: DealFilters) {
    return useQuery({
        queryKey: filters ? dealsKeys.list(filters) : dealsKeys.lists(),
        queryFn: () => dealsApi.list(filters),
        ...cache,
    });
}

export function useDealById(id: string) {
    return useQuery({
        queryKey: dealsKeys.detail(id),
        queryFn: () => dealsApi.getById(id),
        enabled: !!id,
        ...cache,
    });
}

export function useDealBoard() {
    return useQuery({
        queryKey: dealsKeys.board(),
        queryFn: dealsApi.board,
        ...cache,
    });
}

export function useDealMutation() {
    const qc = useQueryClient();

    const refresh = () =>
        Promise.all([
            qc.invalidateQueries({ queryKey: dealsKeys.lists() }),
            qc.invalidateQueries({ queryKey: dealsKeys.board() }),
        ]);

    return {
        update: useMutation({
            mutationFn: ({ id, value }: { id: string; value: UpdateDealInput }) =>
                dealsApi.update(id, value),
            onSuccess: (deal) => {
                qc.setQueryData(dealsKeys.detail(deal.id), deal);
                return refresh();
            },
        }),

        moveStage: useMutation({
            mutationFn: ({ id, value }: { id: string; value: MoveDealStageInput }) =>
                dealsApi.moveStage(id, value),
            onSuccess: ({ deal }) => {
                qc.setQueryData(dealsKeys.detail(deal.id), deal);
                return refresh();
            },
        }),

        delete: useMutation({
            mutationFn: dealsApi.delete,
            onSuccess: (_, id) => {
                qc.removeQueries({ queryKey: dealsKeys.detail(id) });
                return refresh();
            },
        }),
    };
}