import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companiesApi } from "../apis/companies.api";
import { companiesKeys } from "../keys/companies.keys";
import { CreateCompany, UpdateCompany } from "../types/companies.types";

const cache = {
    staleTime: 1000 * 60,
    refetchInterval: 500,
    refetchIntervalInBackground: true,
};

export function useCompanies() {
    return useQuery({
        queryKey: companiesKeys.lists(),
        queryFn: companiesApi.list,
        ...cache,
    });
}

export function useCompanyById(id: string) {
    return useQuery({
        queryKey: companiesKeys.detail(id),
        queryFn: () => companiesApi.getById(id),
        enabled: !!id,
        ...cache,
    });
}

export function useOwnCompany() {
    return useQuery({
        queryKey: companiesKeys.own(),
        queryFn: () => companiesApi.getOwn(),
        ...cache,
        refetchOnWindowFocus: false,
    })
}

export function useOwnCompanyMutation() {
    const qc = useQueryClient();
    const refresh = () => qc.invalidateQueries({ queryKey: companiesKeys.lists() });

    return {
        update: useMutation({
            mutationFn: (value: UpdateCompany) => companiesApi.updateOwn(value),
            onSuccess: (company) => {
                qc.setQueryData(companiesKeys.own(), company);
                return refresh();
            },
        }),
    };
}

export function useCompanyMutation() {
    const qc = useQueryClient();
    const refresh = () => qc.invalidateQueries({ queryKey: companiesKeys.lists() });


    return {
        create: useMutation({
            mutationFn: (value: CreateCompany) => companiesApi.create(value),
            onSuccess: refresh,
        }),
        update: useMutation({
            mutationFn: ({ id, value }: { id: string; value: UpdateCompany }) =>
                companiesApi.update(id, value),
            onSuccess: (company) => {
                qc.setQueryData(companiesKeys.detail(company.id), company);
                return refresh();
            },
        }),

        delete: useMutation({
            mutationFn: companiesApi.delete,
            onSuccess: (_, id) => {
                qc.removeQueries({ queryKey: companiesKeys.detail(id) });
                return refresh();
            },
        }),
    };
}