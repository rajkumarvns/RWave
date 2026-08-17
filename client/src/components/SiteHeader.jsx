import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const DAISYUI_THEMES = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate",
  "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden",
  "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black",
  "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade",
  "night", "coffee", "winter", "dim", "nord", "sunset"
];

const SiteHeader = () => {
  const [selectedTheme, setSelectedTheme] = useState(
    localStorage.getItem("daisyTheme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", selectedTheme);
  }, []);

  const handleThemeChange = (e) => {
    const theme = e.target.value;
    setSelectedTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("daisyTheme", theme);
  };

  return (
    <div className="navbar bg-base-100 shadow-md z-50 relative px-4">
      <div className="flex-1">
        <Link to="/" className="text-3xl font-bold text-primary tracking-tight">
          RWave
        </Link>
      </div>

      <div className="flex-none">
        <select
          name="theme"
          id="theme"
          className="select select-bordered select-sm w-fit bg-base-200 text-base-content capitalize"
          value={selectedTheme}
          onChange={handleThemeChange}
        >
          {DAISYUI_THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SiteHeader;
