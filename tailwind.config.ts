import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#13212f",
        storm: "#1f3548",
        moss: "#2f6b4f",
        ember: "#bf4e30",
        cloud: "#f5f7fb"
      },
      boxShadow: {
        card: "0 20px 45px -28px rgba(20, 31, 44, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
