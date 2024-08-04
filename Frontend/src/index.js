import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
// theme.ts (Version 2 needs to be a tsx file, due to usage of StyleFunctions)
import { SavedPostsProvider } from "./Components/Post/SavedPostsContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider>
        <SavedPostsProvider>
          <App />
        </SavedPostsProvider>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
);
