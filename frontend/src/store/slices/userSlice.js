import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from "@/services";
import { extractErrorMessage } from "@/api";

const initialState = {
  profile: null,
  status: "idle",
  error: null,
};

export const fetchProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userService.getProfile();
      return res.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await userService.updateProfile(payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  "user/uploadAvatar",
  async (file, { rejectWithValue }) => {
    try {
      const res = await userService.uploadAvatar(file);
      return res.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearProfile(state) {
      state.profile = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.status = "succeeded";
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export const { clearProfile } = userSlice.actions;

export const selectProfile = (state) => state.user.profile;
export default userSlice.reducer;
