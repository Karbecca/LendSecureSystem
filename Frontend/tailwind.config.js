/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0A2540', // Navy Blue
                    light: '#1B3B5F', // Lighter Navy
                    dark: '#051324'   // Darker Navy
                },
                secondary: {
                    DEFAULT: '#00D4AA', // Mint/Teal
                    light: '#33DDBB',
                    dark: '#00A886'
                },
                surface: {
                    DEFAULT: '#FFFFFF', // White
                    muted: '#F9FAFB',   // Very light grey
                    border: '#E5E7EB'   // Light border
                },
                text: {
                    primary: '#0F172A',   // Slate 900
                    secondary: '#64748B', // Slate 500
                    muted: '#94A3B8'      // Slate 400
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'float': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
            }
        },
    },
    plugins: [],
}
