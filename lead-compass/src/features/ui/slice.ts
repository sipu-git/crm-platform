import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark" | "system";

export interface UIState {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
}

const THEME_KEY = "crm.theme";
const SIDEBAR_KEY = "crm.sidebar.collapsed";
const initTheme =
  typeof window !== "undefined"
    ? ((localStorage.getItem(THEME_KEY) as ThemeMode) || "system")
    : "system";
const initCollapsed =
  typeof window !== "undefined" ? localStorage.getItem(SIDEBAR_KEY) === "1" : false;

const slice = createSlice({
  name: "ui",
  initialState: { theme: initTheme, sidebarCollapsed: initCollapsed } as UIState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
      if (typeof window !== "undefined") localStorage.setItem(THEME_KEY, action.payload);
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
      if (typeof window !== "undefined")
        localStorage.setItem(SIDEBAR_KEY, action.payload ? "1" : "0");
    },
  },
});

export const { setTheme, setSidebarCollapsed } = slice.actions;
export default slice.reducer;
