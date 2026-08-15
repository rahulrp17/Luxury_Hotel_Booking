import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { hotelService } from "@/services";
import { extractErrorMessage } from "@/api";

const initialState = {
  hotels: [],
  featured: [],
  nearby: [],
  detail: null,
  pagination: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

export const fetchHotels = createAsyncThunk(
  "hotel/fetchHotels",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await hotelService.getHotels(params);
      return res; // { data: [...], pagination }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchFeaturedHotels = createAsyncThunk(
  "hotel/fetchFeaturedHotels",
  async (limit = 6, { rejectWithValue }) => {
    try {
      const res = await hotelService.getFeatured(limit);
      return res.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchNearbyHotels = createAsyncThunk(
  "hotel/fetchNearbyHotels",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await hotelService.getNearby(params);
      return res.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchHotelDetail = createAsyncThunk(
  "hotel/fetchHotelDetail",
  async (id, { rejectWithValue }) => {
    try {
      const res = await hotelService.getHotel(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const hotelSlice = createSlice({
  name: "hotel",
  initialState,
  reducers: {
    clearHotels(state) {
      state.hotels = [];
      state.detail = null;
      state.status = "idle";
      state.error = null;
    },
    resetHotelDetail(state) {
      state.detail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.hotels = action.payload?.data ?? [];
        state.pagination = action.payload?.pagination ?? null;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchFeaturedHotels.fulfilled, (state, action) => {
        state.featured = action.payload ?? [];
      })
      .addCase(fetchFeaturedHotels.rejected, (state, action) => {
        state.featured = [];
        state.error = action.payload;
      })
      .addCase(fetchNearbyHotels.fulfilled, (state, action) => {
        state.nearby = action.payload ?? [];
      })
      .addCase(fetchNearbyHotels.rejected, (state, action) => {
        state.nearby = [];
        state.error = action.payload;
      })
      .addCase(fetchHotelDetail.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchHotelDetail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.detail = action.payload;
      })
      .addCase(fetchHotelDetail.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearHotels, resetHotelDetail } = hotelSlice.actions;

export const selectHotels = (state) => state.hotel.hotels;
export const selectFeaturedHotels = (state) => state.hotel.featured;
export const selectNearbyHotels = (state) => state.hotel.nearby;
export const selectHotelDetail = (state) => state.hotel.detail;
export const selectHotelPagination = (state) => state.hotel.pagination;
export const selectHotelStatus = (state) => state.hotel.status;

export default hotelSlice.reducer;
