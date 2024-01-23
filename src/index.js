import * as React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Home from "./Home";
import Read from "./Read";
import reportWebVitals from "./reportWebVitals";
import * as Ably from "ably";
import { AblyProvider } from "ably/react";
const ABLY_KEY = process.env.REACT_APP_ABLY_KEY;

const client = new Ably.Realtime.Promise({
  key: ABLY_KEY,
  clientId: "react-app",
});

const router = createBrowserRouter([
  {
    path: "/:streamId?",
    element: <Home />,
  },
  {
    path: "read/:streamId?",
    element: <Read />,
  },
]);

createRoot(document.getElementById("root")).render(
  <AblyProvider client={client}>
    <RouterProvider router={router} />
  </AblyProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
