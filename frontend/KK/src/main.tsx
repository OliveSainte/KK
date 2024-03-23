import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

// Create a dark mode theme
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9", // Adjust primary color as needed
    },
    secondary: {
      main: "#ff4081", // Adjust secondary color as needed
    },
    background: {
      default: "#121212", // Adjust default background color as needed
      paper: "#212121", // Adjust paper background color as needed
    },
    text: {
      primary: "#ffffff", // Adjust primary text color as needed
      secondary: "#a6a6a6", // Adjust secondary text color as needed
    },
  },
  typography: {
    fontFamily: "'Monospace', sans-serif",
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
