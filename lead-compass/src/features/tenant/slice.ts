import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface TenantState {
  currentSlug: string | null;
  tenantKey: string | null;
  tenantName: string | null;
}

const TENANT_KEY = "crm.tenant.tenant_key";
const TENANT_SLUG = "crm.tenant.slug";
const TENANT_NAME = "crm.tenant.name";
const initialTenantKey = typeof window !== "undefined" ? localStorage.getItem(TENANT_KEY) : null;
const initialSlug = typeof window !== "undefined" ? localStorage.getItem(TENANT_SLUG) : null;
const initialName = typeof window !== "undefined" ? localStorage.getItem(TENANT_NAME) : null;

const initialState: TenantState = {
  currentSlug: initialSlug,
  tenantKey: initialTenantKey,
  tenantName: initialName,
};

const slice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    setCurrentTenant(
      state,
      action: PayloadAction<{ tenantKey: string; slug?: string | null; name?: string | null }>
    ) {
      const tenantChanged = state.tenantKey !== action.payload.tenantKey;
      state.tenantKey = action.payload.tenantKey;

      if (action.payload.slug !== undefined) {
        state.currentSlug = action.payload.slug;
      } else if (tenantChanged) {
        state.currentSlug = null;
      }
      if (action.payload.name !== undefined) {
        state.tenantName = action.payload.name;
      } else if (tenantChanged) {
        state.tenantName = null;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(TENANT_KEY, action.payload.tenantKey);

        if (action.payload.slug) {
          localStorage.setItem(TENANT_SLUG, action.payload.slug);
        } else if (action.payload.slug === null || tenantChanged) {
          localStorage.removeItem(TENANT_SLUG);
        }

        if (state.tenantName) {
          localStorage.setItem(TENANT_NAME, state.tenantName);
        } else if (action.payload.name === null || tenantChanged) {
          localStorage.removeItem(TENANT_NAME);
        }
      }
    },

    clearTenant(state) {
      state.currentSlug = null;
      state.tenantKey = null;
      state.tenantName = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem(TENANT_KEY);
        localStorage.removeItem(TENANT_SLUG);
        localStorage.removeItem(TENANT_NAME);
      }
    },
  },
});


export const { setCurrentTenant, clearTenant } = slice.actions;
export default slice.reducer;
