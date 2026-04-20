/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'archivo': ['Archivo', 'sans-serif'],
      },
      animation: {
        wave1: "wave1 30s ease-in-out infinite alternate",
        wave2: "wave2 35s ease-in-out infinite alternate",
        wave3: "wave3 40s ease-in-out infinite alternate",
        float1: "float1 18s ease-in-out infinite alternate",
        float2: "float2 22s ease-in-out infinite alternate",
      },
      keyframes: {
        wave1: {
          "0%": { transform: "translate(0%,0%) scale(1)" },
          "100%": { transform: "translate(40%,-30%) scale(1.3)" },
        },
        wave2: {
          "0%": { transform: "translate(50%,50%) scale(1)" },
          "100%": { transform: "translate(-20%,20%) scale(1.4)" },
        },
        wave3: {
          "0%": { transform: "translate(30%,-20%) scale(1)" },
          "100%": { transform: "translate(60%,40%) scale(1.2)" },
        },
        float1: {
          "0%": { transform: "translate(10%,20%) scale(1)" },
          "100%": { transform: "translate(70%,60%) scale(1.2)" },
        },
        float2: {
          "0%": { transform: "translate(80%,10%) scale(1)" },
          "100%": { transform: "translate(20%,70%) scale(1.3)" },
        },
      },
    },
  },
  plugins: [],
}

