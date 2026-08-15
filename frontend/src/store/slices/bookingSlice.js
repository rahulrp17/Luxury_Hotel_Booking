import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bookingService } from "@/services";
import { extractErrorMessage } from "@/api";

const initialState = {
  bookings: [],
  detail: null,
  pagination: null,
  current: null, // transient booking just created
  status: "idle",
  error: null,
};

export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await bookingService.create(payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  "booking/fetchMyBookings",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await bookingService.getMyBookings(params);
      return res; // { data, pagination }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchBookingDetail = createAsyncThunk(
  "booking/fetchBookingDetail",
  async (id, { rejectWithValue }) => {
    try {
      const res = await bookingService.getById(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await bookingService.cancel(id, reason);
      return res.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setCurrentBooking(state, action) {
      state.current = action.payload;
    },
    clearBookingState(state) {
      state.bookings = [];
      state.detail = null;
      state.current = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchMyBookings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.bookings = action.payload?.data ?? [];
        state.pagination = action.payload?.pagination ?? null;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchBookingDetail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.detail = action.payload;
      })
      .addCase(fetchBookingDetail.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const cancelled = action.payload;
        if (state.detail && state.detail._id === cancelled?._id) {
          state.detail = { ...state.detail, ...cancelled };
        }
      });
  },
});

export const { setCurrentBooking, clearBookingState } = bookingSlice.actions;

export const selectBookings = (state) => state.booking.bookings;
export const selectBookingDetail = (state) => state.booking.detail;
export const selectCurrentBooking = (state) => state.booking.current;
export const selectBookingStatus = (state) => state.booking.status;
export const selectBookingPagination = (state) => state.booking.pagination;

export default bookingSlice.reducer;
