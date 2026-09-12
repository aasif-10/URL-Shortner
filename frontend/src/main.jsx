import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { UrlProvider } from "./features/url/context/UrlProvider.jsx";
import { router } from "./routes.jsx";
import { AuthProvider } from "./features/auth/context/AuthProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <UrlProvider>
        <RouterProvider router={router} />
      </UrlProvider>
    </AuthProvider>
  </StrictMode>,
);
