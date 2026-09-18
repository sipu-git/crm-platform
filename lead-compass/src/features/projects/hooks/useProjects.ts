import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leadsKeys } from "@/features/leads/keys/leads.keys";
import { projectsApi } from "../apis/projects.api";
import { projectsKeys } from "../keys/projects.keys";
import type { CreateProjectPayload, ConvertLeadToProjectPayload, ListProjectsParams, UpdateProjectPayload, PaginatedResponse, Project } from "../types";
import { assignmentKeys } from "@/features/leads/keys/assignment.keys";

const cache = { staleTime: 5 * 60_000, gcTime: 15 * 60_000 };
export function useProjects(filters?: ListProjectsParams, enabled = true) {
  return useQuery({
    queryKey: filters ? projectsKeys.list(filters) : projectsKeys.lists(),
    queryFn: () => projectsApi.list(filters),
    enabled,
    staleTime: 60_000,
    select: (response: PaginatedResponse<Project>): Project[] => response.data,
  });
}

export function useProjectById(id: string, enabled = true) {
  return useQuery({
    queryKey: projectsKeys.detail(id),
    queryFn: () => projectsApi.getById(id), 
    enabled: !!id, ...cache
  });
}
export function useProjectMutation() {
  const queryClient = useQueryClient();
  const refreshProjects = () => queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
  const refreshLeads = () => queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
  const refreshAssignee = () => queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
  return {
    // create: useMutation({ mutationFn: (value: CreateProjectPayload) => projectsApi.(value), onSuccess: (project) => { queryClient.setQueryData(projectsKeys.detail(project.id), project); return Promise.all([refreshProjects(), refreshLeads(), refreshAssignee()]); } }),
    convertLead: useMutation({ mutationFn: (value: ConvertLeadToProjectPayload) => projectsApi.convertLead(value), onSuccess: (project, value) => { queryClient.setQueryData(projectsKeys.detail(project.id), project); return Promise.all([refreshProjects(), queryClient.invalidateQueries({ queryKey: leadsKeys.detail(value.lead_id) }), refreshLeads()]); } }),
    update: useMutation({ mutationFn: ({ id, value }: { id: string; value: UpdateProjectPayload }) => projectsApi.update(id, value), onSuccess: (project) => { queryClient.setQueryData(projectsKeys.detail(project.id), project); return refreshProjects(); } }),
  };
}
