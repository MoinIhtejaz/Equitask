import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#11141a",
        storm: "#171d25",
        moss: "#c39a5f",
        ember: "#b45f3a",
        cloud: "#f6f0e5",
        dune: "#ddc08d",
        duneDeep: "#9d7543",
        veil: "#fffaf1"
      },
      boxShadow: {
        card: "0 28px 70px -34px rgba(17, 20, 26, 0.28)",
        luxe: "0 40px 120px -42px rgba(17, 20, 26, 0.34)"
      }
    }
  },
  plugins: []
};

export default config;
