import { createSlice } from "@reduxjs/toolkit";

/**
 * Global search & availability criteria shared across hotel listing, search
 * results, and the booking wizard.
 */
const twoNightsAhead = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};
const fourNightsAhead = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split("T")[0];
};

const initialState = {
  destination: "",
  checkIn: twoNightsAhead(),
  checkOut: fourNightsAhead(),
  guests: { adults: 2, children: 0, rooms: 1 },
  category: "",
  minPrice: "",
  maxPrice: "",
  rating: "",
  sort: "",
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setDestination(state, action) {
      state.destination = action.payload;
    },
    setDates(state, action) {
      state.checkIn = action.payload?.checkIn ?? state.checkIn;
      state.checkOut = action.payload?.checkOut ?? state.checkOut;
    },
    setGuests(state, action) {
      state.guests = { ...state.guests, ...action.payload };
    },
    setFilters(state, action) {
      return { ...state, ...action.payload };
    },
    resetSearch(state) {
      return { ...initialState };
    },
  },
});

export const { setDestination, setDates, setGuests, setFilters, resetSearch } =
  searchSlice.actions;

export const selectSearch = (state) => state.search;
export const selectSearchParams = (state) => {
  const { destination, checkIn, checkOut, guests, category, minPrice, maxPrice, rating, sort } =
    state.search;
  return {
    location: destination || undefined,
    checkIn,
    checkOut,
    adults: guests.adults,
    children: guests.children,
    category: category || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    minRating: rating || undefined,
    sort: sort || undefined,
  };
};

export default searchSlice.reducer;