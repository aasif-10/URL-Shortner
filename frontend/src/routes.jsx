import { createBrowserRouter } from "react-router-dom";
import UrlShort from "./features/url/pages/UrlShort.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <UrlShort />,
  },
]);

export { router };
