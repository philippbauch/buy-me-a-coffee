import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";

const app = document.getElementById("app");
if (!app) {
  throw new Error();
}

const root = ReactDOM.createRoot(app);
root.render(<App />);
