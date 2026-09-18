import { configureStore, combineReducers } from "@reduxjs/toolkit";

import tenant from "@/features/tenant/slice";
import leads from "@/features/leads/slices/lead";
import notifications from "@/features/notifications/slice";
import ui from "@/features/ui/slice";

import communications from '@/features/communications/communication.slice';
import recovery from "@/features/auth/recovery.slice";
import search from '@/features/global-apis/slice';

const appReducer = combineReducers({

  recovery,
  tenant,
  leads,
  notifications,
  communications,
  ui,
  search,
  
});

// Root reducer resets tenant-scoped slices on TENANT_RESET.
export const rootReducer: typeof appReducer = (state, action) => {
  if (action.type === "app/tenantReset" && state) {
    return appReducer(
      {
        ...state,
        leads: undefined as never,
        notifications: undefined as never,
        communications: undefined as never,
        search: undefined as never,
        
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
