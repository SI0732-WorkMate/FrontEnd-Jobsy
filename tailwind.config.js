/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'jobsy-green': '#006c49',        // Verde principal Jobsy [cite: 5, 45, 101, 155]
                'jobsy-green-light': '#10b981',  // Verde para botones [cite: 6, 45, 102, 192]
                'jobsy-bg': '#f8f9ff',           // Fondo de la app [cite: 7, 47, 157, 229]
                'jobsy-surface': '#ffffff',      // Blanco para tarjetas [cite: 7, 47, 157, 229]
                'jobsy-text': '#0b1c30',         // Texto principal oscuro [cite: 5, 44, 100, 154]
                'jobsy-muted': '#3c4a42',        // Texto secundario [cite: 9, 49, 105, 159]
                'jobsy-border': '#bbcabf',       // Bordes de tarjetas [cite: 9, 49, 105, 159]
            },
            fontFamily: {
                'manrope': ['Manrope', 'sans-serif'], // Fuente oficial [cite: 15, 55, 111, 166, 201]
            },
            borderRadius: {
                'jobsy-xl': '0.75rem', // Redondeado de 12px [cite: 12, 52, 108, 163, 198]
            }
        },
    },
    plugins: [],
}