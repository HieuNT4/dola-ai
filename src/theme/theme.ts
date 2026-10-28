"use client";

import { createTheme } from "@mui/material/styles";

const sans = "var(--font-sans), sans-serif";
const display = "var(--font-display), serif";

const heading = {
  fontFamily: display,
  fontWeight: 600,
  letterSpacing: "0px",
};

export const theme = createTheme({
  palette: {
    primary: { main: "#1D4ED8", contrastText: "#FFFFFF" },
    text: { primary: "#111827", secondary: "#5C6778" },
    background: { default: "#F4F7FB", paper: "#FFFFFF" },
    error: { main: "#BE123C" },
    success: { main: "#047857" },
    divider: "#E6EAF2",
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: sans,
    h1: { ...heading, fontSize: "3.4rem", lineHeight: 1.12 },
    h2: { ...heading, fontSize: "2rem", lineHeight: 1.2 },
    h3: { ...heading, fontSize: "1.4rem", lineHeight: 1.3 },
    body1: { fontSize: "1rem", lineHeight: 1.5, letterSpacing: "0px" },
    body2: { fontSize: "0.92rem", lineHeight: 1.5, letterSpacing: "0px" },
    button: { fontFamily: sans, fontWeight: 600, letterSpacing: "0px", textTransform: "none" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 600,
          lineHeight: 1.2,
          letterSpacing: "0px",
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: { textTransform: "none", letterSpacing: "0px", lineHeight: 1.2, borderRadius: 999 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
  },
});
