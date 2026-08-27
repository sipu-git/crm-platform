import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { projectApi } from "./client";
import { Project, ProjectState, CreateProjectPayload, ConvertLeadToProjectPayload, UpdateProjectPayload, ListProjectsParams, } from "./types";

const initialState: ProjectState = {
    items: [],
    listStatus: "idle",
    listError: null,
    pagination: { page: 1, pageSize: 20, total: 0 },
    filters: {},
    selected: null,
    selectedStatus: "idle",
    selectedError: null,
    createStatus: "idle",
    createError: null,
    convertStatus: "idle",
    convertError: null,
    updateStatus: "idle",
    updateError: null,
};

export const fetchProjects = createAsyncThunk(
    "projects/fetchProjects",
    async (params: ListProjectsParams) => projectApi.list(params),
);

export const fetchProjectById = createAsyncThunk(
    "projects/fetchProjectById",
    async (id: string) => projectApi.getById(id),
);

export const createProject = createAsyncThunk(
    "projects/createProject",
    async (payload: CreateProjectPayload) => projectApi.create(payload),
);

export const convertLeadToProject = createAsyncThunk(
    "projects/convertLeadToProject",
    async (payload: ConvertLeadToProjectPayload) => projectApi.convertLead(payload),
);

export const updateProject = createAsyncThunk(
    "projects/updateProject",
    async ({ id, payload }: { id: string; payload: UpdateProjectPayload }) =>
        projectApi.update(id, payload),
);

const projectSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {
        setFilters(state, action: PayloadAction<ListProjectsParams>) {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearSelected(state) {
            state.selected = null;
            state.selectedStatus = "idle";
            state.selectedError = null;
        },
        resetCreateStatus(state) {
            state.createStatus = "idle";
            state.createError = null;
        },
        resetConvertStatus(state) {
            state.convertStatus = "idle";
            state.convertError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // list
            .addCase(fetchProjects.pending, (state) => {
                state.listStatus = "loading";
                state.listError = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.listStatus = "succeeded";
                state.items = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.listStatus = "failed";
                state.listError = action.error.message ?? "Failed to load projects";
            })

            // single
            .addCase(fetchProjectById.pending, (state) => {
                state.selectedStatus = "loading";
                state.selectedError = null;
            })
            .addCase(fetchProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
                state.selectedStatus = "succeeded";
                state.selected = action.payload;
            })
            .addCase(fetchProjectById.rejected, (state, action) => {
                state.selectedStatus = "failed";
                state.selectedError = action.error.message ?? "Failed to load project";
            })

            // create (direct project creation — Path 2)
            .addCase(createProject.pending, (state) => {
                state.createStatus = "loading";
                state.createError = null;
            })
            .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
                state.createStatus = "succeeded";
                state.items.unshift(action.payload);
            })
            .addCase(createProject.rejected, (state, action) => {
                state.createStatus = "failed";
                state.createError = action.error.message ?? "Failed to create project";
            })

            // convert lead (Deal Won — Path 1)
            .addCase(convertLeadToProject.pending, (state) => {
                state.convertStatus = "loading";
                state.convertError = null;
            })
            .addCase(convertLeadToProject.fulfilled, (state, action: PayloadAction<Project>) => {
                state.convertStatus = "succeeded";
                state.items.unshift(action.payload);
            })
            .addCase(convertLeadToProject.rejected, (state, action) => {
                state.convertStatus = "failed";
                state.convertError = action.error.message ?? "Failed to convert lead to project";
            })

            // update
            .addCase(updateProject.pending, (state) => {
                state.updateStatus = "loading";
                state.updateError = null;
            })
            .addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
                state.updateStatus = "succeeded";
                const index = state.items.findIndex((p) => p.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
                if (state.selected?.id === action.payload.id) state.selected = action.payload;
            })
            .addCase(updateProject.rejected, (state, action) => {
                state.updateStatus = "failed";
                state.updateError = action.error.message ?? "Failed to update project";
            });
    },
});

export const { setFilters, clearSelected, resetCreateStatus, resetConvertStatus } = projectSlice.actions;
export default projectSlice.reducer;