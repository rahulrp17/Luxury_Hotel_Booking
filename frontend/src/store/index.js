import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Allow axios config objects carried through rejected/thunk actions.
        ignoredActionPaths: ["payload.config", "payload.headers", "error"],
      },
    }),
  devTools: import.meta.env.DEV,
});

export default store;