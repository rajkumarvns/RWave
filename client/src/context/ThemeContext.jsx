import { createContext, useContext, useState, useEffect } from "react";

export const themes = {
  default: {
    name: "Default (Blue)",
    primary: "#2563eb",
    secondary: "#3b82f6",
    hover: "#1d4ed8",
  },
  whatsapp: {
    name: "WhatsApp",
    primary: "#00a884",
    secondary: "#25D366",
    hover: "#128C7E",
  },
  spotify: {
    name: "Spotify",
    primary: "#1DB954",
    secondary: "#1ED760",
    hover: "#1aa34a",
  },
  discord: {
    name: "Discord",
    primary: "#5865F2",
    secondary: "#7289DA",
    hover: "#4752C4",
  },
  twitter: {
    name: "Twitter",
    primary: "#1D9BF0",
    secondary: "#1A8CD8",
    hover: "#1A8CD8",
  },
  youtube: {
    name: "YouTube",
    primary: "#FF0000",
    secondary: "#FF0000",
    hover: "#CC0000",
  },
  github: {
    name: "GitHub",
    primary: "#24292e",
    secondary: "#24292e",
    hover: "#1b1f23",
  },
};

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [colorTheme, setColorTheme] = useState(localStorage.getItem("colorTheme") || "default");

  useEffect(() => {
    const root = window.document.documentElement;
    const currentThemeConfig = themes[colorTheme] || themes.default;
    
    root.style.setProperty("--color-primary", currentThemeConfig.primary);
    root.style.setProperty("--color-secondary", currentThemeConfig.secondary);
    root.style.setProperty("--color-hover", currentThemeConfig.hover);
    
    localStorage.setItem("colorTheme", colorTheme);
  }, [colorTheme]);

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
