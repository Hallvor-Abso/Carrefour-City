import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Bleu Carrefour : couleur porteuse de l'interface.
        brand: {
          50: "#eaf2fa",
          100: "#d0e2f3",
          200: "#a6c6e6",
          500: "#0050a0",
          600: "#00458b",
          700: "#003c7d",
          900: "#002b58",
        },
        // Rouge Carrefour : reserve aux alertes et a l'espace responsable,
        // pour qu'il garde sa valeur de signal.
        accent: {
          50: "#fdecee",
          100: "#fbd5d8",
          500: "#e30613",
          600: "#c40511",
          700: "#9e040e",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 43 88 / 0.06), 0 1px 3px rgb(0 43 88 / 0.08)",
        raised: "0 4px 12px rgb(0 43 88 / 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
