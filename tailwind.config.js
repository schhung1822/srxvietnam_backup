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
        "lp-bubble": "lp-bubble 13s ease-in-out infinite",
        "lp-bubble-alt": "lp-bubble-alt 16s ease-in-out infinite",
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
        "lp-bubble": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
          "25%": { transform: "translate3d(0.7rem, -0.9rem, 0) scale(1.03) rotate(3deg)" },
          "50%": { transform: "translate3d(-0.5rem, -1.4rem, 0) scale(0.97) rotate(-2deg)" },
          "75%": { transform: "translate3d(0.55rem, -0.55rem, 0) scale(1.02) rotate(1deg)" },
        },
        "lp-bubble-alt": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
          "20%": { transform: "translate3d(-0.55rem, -0.5rem, 0) scale(0.98) rotate(-2deg)" },
          "45%": { transform: "translate3d(0.8rem, -1rem, 0) scale(1.04) rotate(2deg)" },
          "70%": { transform: "translate3d(-0.35rem, -1.3rem, 0) scale(0.96) rotate(-1deg)" },
        },
      },
    },
  },
  plugins: [],
}
