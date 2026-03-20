"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved theme
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("fearless-theme") : null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
      window.localStorage.setItem("fearless-theme", theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
