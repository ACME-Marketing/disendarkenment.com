/** @type {import('tailwindcss').Config} */
export default {
  "content": [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"
  ],
  "theme": {
    "extend": {
      "colors": {
        "primary": "#1A1A1A",
        "secondary": "#4A4A4A",
        "accent": "#FF6B6B",
        "background": "#121212",
        "text": "#FFFFFF",
        "success": "#4CAF50",
        "warning": "#FF6B6B"
      },
      "fontFamily": {
        "sans": [
          "Inter",
          "system-ui",
          "sans-serif"
        ]
      }
    }
  },
  "plugins": [
    "@tailwindcss/typography"
  ]
}