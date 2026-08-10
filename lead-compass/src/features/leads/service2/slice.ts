import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Assignee, CreateAssigneeInput } from "./assign.types";
import { assigneeApis } from "./assign.service";
import { handleApiError } from "@/lib/apiError";

interface AssigneesState {
    assignees: Assignee[] | null;
    error: string | null;
    loading: boolean;
    success: boolean;
}

const INITIAL_STATE: AssigneesState = {
    assignees: null,
    error: null,
    loading: false,
    success: false,
};

export const createAssign = createAsyncThunk(
    "assignees/create",
    async (data: CreateAssigneeInput, { rejectWithValue }) => {
        try {
            const response = await assigneeApis.create(data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const fetchAssignees = createAsyncThunk(
    "assignees/fetchAll",
    async (_: void, { rejectWithValue }) => {
        try {
            const response = await assigneeApis.list();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const assigneesSlice = createSlice({
    name: "assignees",
    initialState: INITIAL_STATE,
    reducers: {
        resetAssigneeStatus(state) {
            state.error = null;
            state.success = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // createAssign
            .addCase(createAssign.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createAssign.fulfilled, (state, action: PayloadAction<Assignee>) => {
                state.loading = false;
                state.success = true;
                state.assignees = state.assignees
                    ? [...state.assignees, action.payload]
                    : [action.payload];
            })
            .addCase(createAssign.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = (action.payload as string) ?? "Failed to create assignee";
            })
            // fetchAssignees
            .addCase(fetchAssignees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAssignees.fulfilled, (state, action: PayloadAction<Assignee[]>) => {
                state.loading = false;
                state.assignees = action.payload;
            })
            .addCase(fetchAssignees.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) ?? "Failed to fetch assignees";
            });
    },
});

export const { resetAssigneeStatus } = assigneesSlice.actions;
export default assigneesSlice.reducer;

// selectors
export const selectAssignees = (state: { assignees: AssigneesState }) => state.assignees.assignees;
export const selectAssigneesLoading = (state: { assignees: AssigneesState }) => state.assignees.loading;
export const selectAssigneesError = (state: { assignees: AssigneesState }) => state.assignees.error;
export const selectAssigneesSuccess = (state: { assignees: AssigneesState }) => state.assignees.success;