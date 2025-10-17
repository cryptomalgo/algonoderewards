import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light";
export type ThemeSetting = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  themeSetting: ThemeSetting;
  setThemeSetting: (theme: ThemeSetting) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getThemeFromUrl = (): ThemeSetting => {
  if (typeof window === "undefined") return "system";

  const url = new URL(window.location.href);
  const themeParam = url.searchParams.get("theme");

  if (
    themeParam === "dark" ||
    themeParam === "light" ||
    themeParam === "system"
  ) {
    return themeParam;
  }

  return "system";
};

const setThemeSettingInUrl = (themeSetting: ThemeSetting) => {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.set("theme", themeSetting);

  // Update URL without reloading the page
  window.history.replaceState({}, "", url.toString());
};

export function ThemeProvider({
  children,
  defaultThemeSetting = "system",
}: {
  children: React.ReactNode;
  defaultThemeSetting?: ThemeSetting;
}) {
  const [themeSetting, setThemeSettingState] = useState<ThemeSetting>(() => {
    return getThemeFromUrl() || defaultThemeSetting;
  });

  const [systemTheme, setSystemTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const setThemeSetting = (newTheme: ThemeSetting) => {
    setThemeSettingState(newTheme);
    setThemeSettingInUrl(newTheme);
  };

  // Compute actual theme without storing it in state
  const actualTheme: Theme =
    themeSetting === "system" ? systemTheme : themeSetting;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(actualTheme);
  }, [actualTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: actualTheme,
        themeSetting: themeSetting,
        setThemeSetting,
      }}
    >
      <meta
        name="theme-color"
        content={actualTheme === "dark" ? "#030712" : "#fff"}
      />
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
