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
                    DEFAULT: '#10b981', // Emerald 500 (Reverted)
                    light: '#34d399',   // Emerald 400
                    dark: '#059669',    // Emerald 600
                    sidebarTop: '#0F2A44',
                    sidebarBottom: '#0a1d30',
                    card: '#10b981'     // Emerald 500
                },
                'royal-card': '#0B5ED7', // Custom Blue for Lender Dashboard
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
