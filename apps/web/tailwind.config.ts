import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2933",
        paper: "#f7f8f5",
        line: "#d8ddd4",
        herb: "#4f7d5b",
        tomato: "#c85a4b",
        amber: "#d49d3a"
      },
      boxShadow: {
        soft: "0 12px 40px rgba(31, 41, 51, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
