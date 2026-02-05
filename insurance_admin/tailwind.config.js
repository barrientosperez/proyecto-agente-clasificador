/** @type {import('tailwindcss').Config} */

const withMT = require("@material-tailwind/react/utils/withMT");

const flowbite = require("flowbite-react/tailwind");

module.exports = withMT({
  content: ["./node_modules/flowbite/**/*.js", "./src/**/*.{js,jsx,ts,tsx}", "./index.html", flowbite.content()],
  mode: "jit",
  safelist: [
    { pattern: /grid-cols-./ },
    { pattern: /grid-rows-./ }
  ],
  theme: {
    extend: {
      darkMode: 'class',
      colors: {
        primary: { "50": "#eff6ff", "100": "#dbeafe", "200": "#bfdbfe", "300": "#93c5fd", "400": "#60a5fa", "500": "#3b82f6", "600": "#2563eb", "700": "#1d4ed8", "800": "#1e40af", "900": "#1e3a8a", "950": "#172554" }
      },
      fontFamily: {
        'body': [
          'Open Sans',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji'
        ],
        'sans': [
          'Open Sans',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji'
        ]
      },
    },
    screens: {
      xs: "480px",
      ss: "620px",
      sm: "768px",
      md: "1060px",
      lg: "1200px",
      xl: "1700px",
      uxl: "2000px",
    },
  },
  plugins: [
    require('flowbite/plugin')({
      charts: true,
    }),
    flowbite.plugin(),
    require('@tailwindcss/typography')
  ],
});