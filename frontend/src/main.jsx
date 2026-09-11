import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { UrlProvider } from "./features/url/context/UrlProvider.jsx";
import { router } from "./routes.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UrlProvider>
      <RouterProvider router={router} />
    </UrlProvider>
  </StrictMode>,
);
