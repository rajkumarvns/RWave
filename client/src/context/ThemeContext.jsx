import { createContext, useContext, useState, useEffect } from "react";


export const chatWallpapers = {
  default: {
    name: "Default (Cubes)",
    url: "https://www.transparenttextures.com/patterns/cubes.png",
    opacity: "0.05",
  },
  dots: {
    name: "Dots",
    url: "https://www.transparenttextures.com/patterns/dots-pattern.png",
    opacity: "0.05",
  },
  whatsapp: {
    name: "Doodles",
    url: "https://www.transparenttextures.com/patterns/connected.png",
    opacity: "0.05",
  },
  solidDark: {
    name: "Solid Black",
    url: "",
    overlayColor: "#000000",
    opacity: "1",
  },
};

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [chatWallpaper, setChatWallpaper] = useState(localStorage.getItem("chatWallpaper") || "default");

  useEffect(() => {
    localStorage.setItem("chatWallpaper", chatWallpaper);
  }, [chatWallpaper]);

  return (
    <ThemeContext.Provider value={{ chatWallpaper, setChatWallpaper }}>
      {children}
    </ThemeContext.Provider>
  );
};
