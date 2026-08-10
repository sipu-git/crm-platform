import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { handleApiError } from "@/lib/apiError";
import { companyApis } from "./company.service";
import type { Company, CompanyState, CreateCompany, UpdateCompany } from "./company.types";

const initialState: CompanyState = { companies: [], companyDetail: null, loading: false, error: null, success: false };
const payload = <T,>(response: { data: { data?: T } }) => response.data.data as T;

export const fetchCompanies = createAsyncThunk("companies/list", async (_, { rejectWithValue }) => { try { return payload<Company[]>(await companyApis.list()); } catch (error) { return rejectWithValue(handleApiError(error)); } });
export const fetchCompany = createAsyncThunk("companies/getById", async (id: string, { rejectWithValue }) => { try { return payload<Company>(await companyApis.getById(id)); } catch (error) { return rejectWithValue(handleApiError(error)); } });
export const createCompany = createAsyncThunk("companies/create", async (data: CreateCompany, { rejectWithValue }) => { try { return payload<Company>(await companyApis.create(data)); } catch (error) { return rejectWithValue(handleApiError(error)); } });
export const updateCompany = createAsyncThunk("companies/update", async ({ id, data }: { id: string; data: UpdateCompany }, { rejectWithValue }) => { try { return payload<Company>(await companyApis.update(id, data)); } catch (error) { return rejectWithValue(handleApiError(error)); } });
export const deleteCompany = createAsyncThunk("companies/delete", async (id: string, { rejectWithValue }) => { try { await companyApis.remove(id); return id; } catch (error) { return rejectWithValue(handleApiError(error)); } });

const replace = (state: CompanyState, company: Company) => { const index = state.companies.findIndex((item) => item.id === company.id); if (index >= 0) state.companies[index] = company; };
const rejected = (state: CompanyState, action: { payload: unknown }) => { state.loading = false; state.success = false; state.error = action.payload as string; };

export const companySlice = createSlice({
  name: "companies", initialState,
  reducers: { clearCompanyDetail: (state) => { state.companyDetail = null; }, clearCompanyState: (state) => { state.error = null; state.success = false; } },
  extraReducers: (builder) => { builder
    .addCase(fetchCompanies.pending, (state) => { state.loading = true; state.error = null; })
    .addCase(fetchCompanies.fulfilled, (state, action) => { state.loading = false; state.companies = action.payload; })
    .addCase(fetchCompanies.rejected, rejected)
    .addCase(fetchCompany.pending, (state) => { state.loading = true; state.error = null; })
    .addCase(fetchCompany.fulfilled, (state, action) => { state.loading = false; state.companyDetail = action.payload; replace(state, action.payload); })
    .addCase(fetchCompany.rejected, rejected)
    .addCase(createCompany.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
    .addCase(createCompany.fulfilled, (state, action) => { state.loading = false; state.companies.unshift(action.payload); state.success = true; })
    .addCase(createCompany.rejected, rejected)
    .addCase(updateCompany.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
    .addCase(updateCompany.fulfilled, (state, action) => { state.loading = false; replace(state, action.payload); state.companyDetail = action.payload; state.success = true; })
    .addCase(updateCompany.rejected, rejected)
    .addCase(deleteCompany.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
    .addCase(deleteCompany.fulfilled, (state, action) => { state.loading = false; state.companies = state.companies.filter((company) => company.id !== action.payload); if (state.companyDetail?.id === action.payload) state.companyDetail = null; state.success = true; })
    .addCase(deleteCompany.rejected, rejected); },
});

export const { clearCompanyDetail, clearCompanyState } = companySlice.actions;
export default companySlice.reducer;
