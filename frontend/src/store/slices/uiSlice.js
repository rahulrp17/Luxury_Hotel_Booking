import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarOpen: false,
  mobileMenuOpen: false,
  theme: "light",
  globalLoading: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar(state, action) {
      state.sidebarOpen = Boolean(action.payload);
    },
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenu(state, action) {
      state.mobileMenuOpen = Boolean(action.payload);
    },
    setTheme(state, action) {
      state.theme = action.payload;
    },
    setGlobalLoading(state, action) {
      state.globalLoading = Boolean(action.payload);
    },
  },
});

export const {
  toggleSidebar,
  setSidebar,
  toggleMobileMenu,
  setMobileMenu,
  setTheme,
  setGlobalLoading,
} = uiSlice.actions;

export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectTheme = (state) => state.ui.theme;
export const selectGlobalLoading = (state) => state.ui.globalLoading;

export default uiSlice.reducer;
