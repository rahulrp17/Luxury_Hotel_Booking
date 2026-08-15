import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@/services";
import { tokenStore } from "@/utils/storage";
import { extractErrorMessage } from "@/api";

const initialState = {
  user: tokenStore.getCachedUser() || null,
  accessToken: tokenStore.getAccessToken() || null,
  isAuthenticated: Boolean(tokenStore.getAccessToken()),
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authService.login(credentials);
      return res.data; // { user, accessToken }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authService.register(payload);
      return res.data; // user (no token — email verification first)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.getMe();
      return res.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout();
  } catch {
    // Best-effort: still clear local auth state
  }
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken(state, action) {
      state.accessToken = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      if (action.payload) tokenStore.setAccessToken(action.payload);
    },
    setUser(state, action) {
      state.user = action.payload;
      if (action.payload) tokenStore.cacheUser(action.payload);
    },
    resetAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      tokenStore.clearAll();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload?.user ?? state.user;
        state.accessToken = action.payload?.accessToken ?? null;
        state.isAuthenticated = Boolean(action.payload?.accessToken);
        if (action.payload?.accessToken) tokenStore.setAccessToken(action.payload.accessToken);
        if (action.payload?.user) tokenStore.cacheUser(action.payload.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload ?? state.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.status = "succeeded";
        if (action.payload) tokenStore.cacheUser(action.payload);
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.error = action.payload;
        state.status = "failed";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.error = null;
        tokenStore.clearAll();
      });
  },
});

export const { setAccessToken, setUser, resetAuth } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.status;

export default authSlice.reducer;
