/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",
        primaryLight: "#3B5FC7",
        secondary: "#10B981",
        accent: "#F59E0B",
        bg: "#F9FAFB",
        card: "#FFFFFF",
        text: "#111827",
        textLight: "#6B7280",
        border: "#E5E7EB",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
};
