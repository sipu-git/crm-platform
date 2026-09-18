import { useQuery } from "@tanstack/react-query";
import type { ListProjectsParams, PaginatedResponse, Project } from "../types/projects.types";
import { projectsApi } from "../apis/projects.api";
import { projectsKeys } from "../keys/projects.keys";

export function useClientProjects(filters?: ListProjectsParams, enabled = true) {
  return useQuery({
    queryKey: filters ? projectsKeys.own(filters) : projectsKeys.ownLists(),
    queryFn: () => projectsApi.own(filters),
    enabled,
    staleTime: 60_000,
    select: (response: PaginatedResponse<Project>): Project[] => response.data,
  });
}

export function useClientProjectById(id: string | null) {
  return useQuery({
    queryKey: projectsKeys.detail(id ?? ""),
    queryFn: () => projectsApi.getClientProject(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}
