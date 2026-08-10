import { configureStore, combineReducers } from "@reduxjs/toolkit";
import auth from "@/features/auth/slice";
import tenant from "@/features/tenant/slice";
import leads from "@/features/leads/service1/slice";
import deals from "@/features/deals/slice";
import invoiceItems from "@/features/invoices/service1/slice";
import invoices from "@/features/invoices/service2/slice";
import notifications from "@/features/notifications/slice";
import ui from "@/features/ui/slice";
import contacts from "@/features/contacts/slice";
import activities from "@/features/activities/slice";
import audit from "@/features/audit/slice";
import companies from "@/features/companies/slice";
import communications from '@/features/communications/communication.slice';
import assignees from "@/features/leads/service2/slice";

const appReducer = combineReducers({
  auth,
  tenant,
  leads,
  deals,
  invoiceItems,
  invoices,
  notifications,
  communications,
  ui,
  assignees,
  contacts,
  activities,
  audit,
  companies,
});

// Root reducer resets tenant-scoped slices on TENANT_RESET.
export const rootReducer: typeof appReducer = (state, action) => {
  if (action.type === "app/tenantReset" && state) {
    return appReducer(
      {
        ...state,
        leads: undefined as never,
        deals: undefined as never,
        invoiceItems: undefined as never,
        invoices: undefined as never,
        notifications: undefined as never,
        communications: undefined as never,
        contacts: undefined as never,
        activities: undefined as never,
        audit: undefined as never,
        companies: undefined as never,
      },
      action,
    );
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const tenantReset = () => ({ type: "app/tenantReset" as const });
