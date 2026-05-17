export const theme = {
  colors: {
    background: "#0B0B0B",
    surface: "#161616",
    surfaceElevated: "rgba(27, 27, 27, 0.82)",
    surfaceGlass: "rgba(255, 255, 255, 0.06)",
    border: "rgba(255, 255, 255, 0.12)",
    borderStrong: "rgba(212, 175, 55, 0.42)",
    gold: "#D4AF37",
    goldSoft: "rgba(212, 175, 55, 0.16)",
    text: "#FFFFFF",
    textMuted: "rgba(255, 255, 255, 0.68)",
    textDim: "rgba(255, 255, 255, 0.42)",
    success: "#00C853",
    error: "#FF3B30",
    warning: "#FFB020",
    info: "#3A86FF"
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem"
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    headingWeight: 800,
    bodyWeight: 500
  },
  shadows: {
    glowGold: "0 0 32px rgba(212, 175, 55, 0.32)",
    glowGreen: "0 0 28px rgba(0, 200, 83, 0.28)",
    panel: "0 24px 80px rgba(0, 0, 0, 0.42)"
  },
  animations: {
    fast: "150ms ease",
    normal: "240ms ease",
    slow: "420ms ease"
  },
  breakpoints: {
    sm: "480px",
    md: "768px",
    lg: "1024px",
    xl: "1280px"
  }
};

export type AppTheme = typeof theme;
