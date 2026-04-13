import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  Theme as NavigationTheme,
} from "@react-navigation/native";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ColorSchemeName } from "react-native";

const THEME_STORAGE_KEY = "app-theme-mode";

const radii = { xl: 24, lg: 18, md: 14, pill: 999 };
const spacing = (n: number) => n * 8;
type GradientColors = readonly [string, string, ...string[]];

type ThemeColors = {
  bg: string;
  bgSecondary: string;
  card: string;
  cardStrong: string;
  border: string;
  text: string;
  muted: string;
  chipText: string;
  purple: string;
  blue: string;
  primary: string;
  primaryMuted: string;
  success: string;
  warning: string;
  danger: string;
  inputBg: string;
  icon: string;
  overlay: string;
  shadow: string;
  white: string;
  headerButton: string;
  heroBorder: string;
  reviewSurface: string;
  reviewButton: string;
  pillBg: string;
  pillBorder: string;
  pillActiveBg: string;
  pillActiveBorder: string;
  aboutIconBg: string;
  toggleOff: [string, string];
  headerGradient: [string, string];
  primaryGradient: [string, string];
  statGradient: [string, string];
  settingsCardGradient: [string, string];
  settingsHeroGradient: [string, string];
  profileHeroGradient: GradientColors;
  cardGradient: GradientColors;
};

export type AppTheme = {
  mode: "light" | "dark";
  colors: ThemeColors;
  r: typeof radii;
  s: typeof spacing;
};

export type ThemePreference = "light" | "dark" | "system";

const darkColors: ThemeColors = {
  bg: "#0B0F17",
  bgSecondary: "#111827",
  card: "rgba(30,41,59,0.5)",
  cardStrong: "rgba(15,23,42,0.82)",
  border: "rgba(51,65,85,1)",
  text: "#FFFFFF",
  muted: "#94A3B8",
  chipText: "#CBD5E1",
  purple: "#A78BFA",
  blue: "#2563EB",
  primary: "#2563EB",
  primaryMuted: "#60A5FA",
  success: "#22C55E",
  warning: "#FBBF24",
  danger: "#EF4444",
  inputBg: "rgba(30,41,59,0.35)",
  icon: "rgba(148,163,184,1)",
  overlay: "rgba(0,0,0,0.6)",
  shadow: "#000000",
  white: "#FFFFFF",
  headerButton: "rgba(255,255,255,0.12)",
  heroBorder: "rgba(96,165,250,0.18)",
  reviewSurface: "rgba(124,92,255,0.22)",
  reviewButton: "rgba(255,255,255,0.12)",
  pillBg: "rgba(51,65,85,0.45)",
  pillBorder: "rgba(148,163,184,0.18)",
  pillActiveBg: "rgba(37,99,235,0.18)",
  pillActiveBorder: "rgba(96,165,250,0.28)",
  aboutIconBg: "rgba(37,99,235,0.14)",
  toggleOff: ["rgba(51,65,85,1)", "rgba(51,65,85,1)"],
  headerGradient: ["#2563EB", "#7C3AED"],
  primaryGradient: ["#2563EB", "#7C3AED"],
  statGradient: ["rgba(30,41,59,0.85)", "rgba(15,23,42,0.85)"],
  settingsCardGradient: ["rgba(30,41,59,0.85)", "rgba(15,23,42,0.85)"],
  settingsHeroGradient: ["rgba(37,99,235,0.28)", "rgba(124,58,237,0.16)"],
  profileHeroGradient: ["#172554", "#111827", "#020617"],
  cardGradient: ["rgba(30,41,59,0.95)", "rgba(15,23,42,0.92)"],
};

const lightColors: ThemeColors = {
  bg: "#F4F7FB",
  bgSecondary: "#E8EEF8",
  card: "rgba(255,255,255,0.92)",
  cardStrong: "rgba(255,255,255,0.98)",
  border: "rgba(203,213,225,0.9)",
  text: "#0F172A",
  muted: "#64748B",
  chipText: "#334155",
  purple: "#7C3AED",
  blue: "#2563EB",
  primary: "#2563EB",
  primaryMuted: "#3B82F6",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  inputBg: "rgba(255,255,255,0.95)",
  icon: "#475569",
  overlay: "rgba(15,23,42,0.25)",
  shadow: "#0F172A",
  white: "#FFFFFF",
  headerButton: "rgba(255,255,255,0.2)",
  heroBorder: "rgba(96,165,250,0.28)",
  reviewSurface: "rgba(37,99,235,0.12)",
  reviewButton: "rgba(37,99,235,0.1)",
  pillBg: "rgba(226,232,240,0.85)",
  pillBorder: "rgba(148,163,184,0.28)",
  pillActiveBg: "rgba(37,99,235,0.12)",
  pillActiveBorder: "rgba(59,130,246,0.22)",
  aboutIconBg: "rgba(37,99,235,0.1)",
  toggleOff: ["rgba(203,213,225,1)", "rgba(226,232,240,1)"],
  headerGradient: ["#1D4ED8", "#6D28D9"],
  primaryGradient: ["#2563EB", "#7C3AED"],
  statGradient: ["rgba(255,255,255,0.96)", "rgba(226,232,240,0.98)"],
  settingsCardGradient: ["rgba(255,255,255,0.95)", "rgba(241,245,249,0.98)"],
  settingsHeroGradient: ["rgba(37,99,235,0.16)", "rgba(124,58,237,0.1)"],
  profileHeroGradient: ["#E0F2FE", "#F8FAFC", "#FFFFFF"],
  cardGradient: ["#FFFFFF", "#F1F5F9"],
};

function createAppTheme(mode: "light" | "dark"): AppTheme {
  return {
    mode,
    colors: mode === "dark" ? darkColors : lightColors,
    r: radii,
    s: spacing,
  };
}

function resolveMode(
  preference: ThemePreference,
  systemScheme: ColorSchemeName,
): "light" | "dark" {
  if (preference === "system") {
    return systemScheme === "dark" ? "dark" : "light";
  }

  return preference;
}

function createNavigationTheme(theme: AppTheme): NavigationTheme {
  const base =
    theme.mode === "dark" ? NavigationDarkTheme : NavigationDefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.bg,
      card: theme.colors.cardStrong,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };
}

type ThemeContextValue = {
  theme: AppTheme;
  mode: "light" | "dark";
  preference: ThemePreference;
  isDark: boolean;
  isHydrated: boolean;
  navigationTheme: NavigationTheme;
  setPreference: (preference: ThemePreference) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setStoredPreference] = useState<ThemePreference>("system");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadPreference = async () => {
      try {
        const value = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (
          mounted &&
          (value === "light" || value === "dark" || value === "system")
        ) {
          setStoredPreference(value);
        }
      } finally {
        if (mounted) setIsHydrated(true);
      }
    };

    void loadPreference();

    return () => {
      mounted = false;
    };
  }, []);

  const setPreference = async (nextPreference: ThemePreference) => {
    setStoredPreference(nextPreference);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, nextPreference);
  };

  const mode = resolveMode(preference, systemScheme);
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const navigationTheme = useMemo(() => createNavigationTheme(theme), [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      preference,
      isDark: mode === "dark",
      isHydrated,
      navigationTheme,
      setPreference,
      toggleTheme: async () => {
        const nextPreference = mode === "dark" ? "light" : "dark";
        await setPreference(nextPreference);
      },
    }),
    [theme, mode, preference, isHydrated, navigationTheme],
  );

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }

  return context;
}

export function useThemedStyles<T>(factory: (theme: AppTheme) => T): T {
  const { theme } = useAppTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}

export const theme = createAppTheme("dark");
