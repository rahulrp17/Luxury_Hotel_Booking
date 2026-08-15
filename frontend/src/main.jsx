import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import { MotionConfig } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";

import App from "@/App";
import { store } from "@/store";
import { queryClient } from "@/api/queryClient";
import { ToasterConfig } from "@/services/toast";
import "@/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Provider store={store}>
          <BrowserRouter>
            <MotionConfig reducedMotion="user">
              <App />
              <Toaster {...ToasterConfig} />
            </MotionConfig>
          </BrowserRouter>
        </Provider>
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>
);
