/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'jelly-bean': {
                    50: '#effbfc',
                    100: '#d6f4f7',
                    200: '#b1e7f0',
                    300: '#7bd4e5',
                    400: '#3eb8d2',
                    500: '#239cb7',
                    600: '#1e7792',
                    700: '#20667e',
                    800: '#225468',
                    900: '#214758',
                    950: '#102d3c',
                },
            },
        },
    },
    plugins: [],
}
