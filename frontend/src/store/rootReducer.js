import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import hotelReducer from "./slices/hotelSlice";
import bookingReducer from "./slices/bookingSlice";
import searchReducer from "./slices/searchSlice";
import notificationReducer from "./slices/notificationSlice";
import uiReducer from "./slices/uiSlice";

/**
 * Root reducer. Add new feature slices here.
 */
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  hotel: hotelReducer,
  booking: bookingReducer,
  search: searchReducer,
  notification: notificationReducer,
  ui: uiReducer,
});

export default rootReducer;
