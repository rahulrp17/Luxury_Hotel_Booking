import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationService } from "@/services";
import { extractErrorMessage } from "@/api";

const initialState = {
  notifications: [],
  unreadCount: 0,
  pagination: null,
  status: "idle",
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await notificationService.getMyNotifications(params);
      return res; // { data, unreadCount, pagination }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Lightweight unread-only sync. Uses a single-row `unreadOnly` query so the
// backend still returns the true unreadCount, without replacing the full list
// cached in the store (used by the notifications inbox / account overview).
export const fetchUnreadCount = createAsyncThunk(
  "notification/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationService.getMyNotifications({
        unreadOnly: "true",
        page: 1,
        limit: 1,
      });
      return Number(res?.unreadCount) || 0;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const markAllRead = createAsyncThunk(
  "notification/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllRead();
      return true;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const markRead = createAsyncThunk(
  "notification/markRead",
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.markRead(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const removeNotification = createAsyncThunk(
  "notification/removeNotification",
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.notifications = action.payload?.data ?? [];
        state.unreadCount = action.payload?.unreadCount ?? 0;
        state.pagination = action.payload?.pagination ?? null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload ?? 0;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const id = action.payload;
        const target = state.notifications.find((n) => n._id === id);
        if (target && !target.isRead) {
          target.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const target = state.notifications.find((n) => n._id === id);
        state.notifications = state.notifications.filter((n) => n._id !== id);
        if (target && !target.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1);
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;

export const selectNotifications = (state) => state.notification.notifications;
export const selectUnreadCount = (state) => state.notification.unreadCount;
export const selectNotificationStatus = (state) => state.notification.status;
export const selectNotificationPagination = (state) => state.notification.pagination;

export default notificationSlice.reducer;
