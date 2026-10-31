import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FAF7F2",
        "surface-soft": "#F4EDE3",
        "surface-card": "#EBE2D5",
        "surface-cream-strong": "#E2D6C5",
        // Alternate deep surfaces - warm espresso mocha instead of harsh black/navy
        "surface-dark": "#362F2A",
        "surface-dark-elevated": "#453C36",
        "surface-dark-soft": "#2D2622",
        hairline: "#DFD5C7",
        "hairline-soft": "#E8DFD3",
        primary: {
          DEFAULT: "#C86D51",
          active: "#AB553B",
          disabled: "#E5DDD3",
        },
        // Alternate ink - warm deep espresso instead of black (#000000 / #141413)
        ink: "#2C2521",
        "body-strong": "#3C332E",
        body: "#544A43",
        muted: {
          DEFAULT: "#7B6F66",
          soft: "#9A8D83",
        },
        "accent-teal": "#4F9888",
        "accent-amber": "#D89648",
        "on-primary": "#FAF7F2",
        "on-dark": "#FAF7F2",
        "on-dark-soft": "#C7BCB1",
        status: {
          success: "#52A769",
          warning: "#CC9324",
          error: "#BD4B4B",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Tiempos Headline", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
