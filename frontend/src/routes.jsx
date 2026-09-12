import { createBrowserRouter } from "react-router-dom";
import UrlShort from "./features/url/pages/UrlShort.jsx";
import Login from "./features/auth/pages/Login.jsx";
import Register from "./features/auth/pages/Register.jsx";
import Protected from "./features/auth/components/protected/Protected.jsx";

const router = createBrowserRouter([
  {
    element: <Protected />,
    children: [
      {
        path: "/",
        element: <UrlShort />,
      },
    ],
  },
  {
    path: "/auth/login",
    element: <Login />,
  },
  {
    path: "/auth/register",
    element: <Register />,
  },
]);

export { router };
