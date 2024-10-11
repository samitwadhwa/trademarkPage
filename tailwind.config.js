// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        myCustomFont: ['MyCustomFont', 'sans-serif'], // Add your custom font here
      },
      colors: {
        primary: {
          // light: '#7fa4ff',
          DEFAULT: '#4380EC', 
          // dark: '#004ecb',
        },
        lightening: {
          DEFAULT: '#F8FAFE',
        },
        background: {
          DEFAULT: '#E7E6E6',
        },
        secondary: {
          // light: '#ffe58b',
          DEFAULT: '#313131',
          // dark: '#cc9a06',
        },
        neutral: {
          light: '#f5f5f5',  // Light background
          DEFAULT: '#cccccc', // Neutral color
          dark: '#333333',    // Dark text color or border
        },
        success: '#41B65C',
        warning: '#ffc107',
        danger: '#EC3C3C',
        info: '#ECC53C',
      },
    },
  },
  plugins: [],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
};
