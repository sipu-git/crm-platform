import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profilesApi } from "../apis/profiles.api";
import { profilesKeys } from "../keys/profiles.keys";
import { TENANT_UPDATE_KEYS, USER_UPDATE_KEYS, type DeleteProfilePayload, type Profile, type UpdateProfilePayload } from "../types";
const cache = { staleTime: 5 * 60_000, gcTime: 15 * 60_000 };

export function useProfile() {
    return useQuery({
        queryKey: profilesKeys.current(),
        queryFn: profilesApi.get, ...cache
    });
}

function pick<K extends string>(obj: Record<string, unknown>, keys: readonly K[]) {
    return Object.fromEntries(
        keys.filter((k) => k in obj).map((k) => [k, obj[k]]),
    ) as Partial<Record<K, unknown>>;
}

export function useProfileMutation() {
    const qc = useQueryClient();
    return {
        update: useMutation({
            mutationFn: (value: UpdateProfilePayload) => profilesApi.update(value),
            onSuccess: (data: any) => {
                qc.setQueryData<Profile>(profilesKeys.current(), (old) => {
                    if (!old) return old;
                    const userPatch = data.user ?? pick(data, USER_UPDATE_KEYS);
                    const tenantPatch = data.tenant ?? pick(data, TENANT_UPDATE_KEYS);

                    return {
                        user: { ...old.user, ...userPatch },
                        tenant: { ...old.tenant, ...tenantPatch },
                    };
                });
            },
        }),
        delete: useMutation({
            mutationFn: (value: DeleteProfilePayload) => profilesApi.delete(value),
            onSuccess: () => qc.removeQueries({ queryKey: profilesKeys.all }),
        }),
    };
}
