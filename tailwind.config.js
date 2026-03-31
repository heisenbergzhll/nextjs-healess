/** @type {import('tailwindcss').Config} */
const rtl = require('tailwindcss-rtl');

function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}
module.exports = {
  // important: true,

  corePlugins: {
    preflight: false,
  },
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './packages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [rtl],

  theme: {
    fontFamily: {
      Poppins: ['Poppins'],
    },
    extend: {
      colors: {
        CheckoutPlaceHolder: '#ADADAD',
        CheckoutLabel: '#141414', //label color for checkout
        fadedText: '#CACACA', //light gray text for secondary price
        commonBorder: '#ececec',
        hoverEffect: '#64687A', //hoverEffect for filter or for light gray text
        bannerBorder: '#bbd8de' /*blue border main banner*/,
        colorBackground: '#f2f2f2' /*banner background*/,
        boxShadow: 'rgba(0, 0, 0, 0.15)' /*box shadow color*/,
        colorBorder: '#d2d2d2' /*faded border*/,
        darkBackground: '#081c3c' /*for dark grey buttons*/,
        toneLight: '#d9efff' /*nmbering on marketplace page*/,
        white: '#ffffff' /*normal white for future customization*/,
        darkGreyBackground:
          '#2C3145' /*darkBackground of corner offer and best offer*/,
        offWhite:
          '#F7F8F6' /*offwhite for light columns in corner offer component*/,
        testimonialBg: '#F9F9F9' /*testimonial background*/,
        mainBanner: '#163564' /*main banner dark blue shade for text*/,
        offerbg:
          '#F6FFFC' /*offwhite for light columns in brand collection component component*/,
        main: withOpacityValue('--color-main'),
        primary: withOpacityValue('--color-primary'),
        secondary: withOpacityValue('--color-secondary'),
        brand: withOpacityValue('--color-brand'),
        star: withOpacityValue('--color-star'),
        tabColor: withOpacityValue('--color-tab'),
        iconCheckout: withOpacityValue('color-iconCheckout'),
        closeIconColor: '#B5B5B5',
        error: '#E85115',
        link: '#115E59',
        reviewText: '#64687a',
        textShopping: '#191919',
        hoverButton: '#27775c',
        checkoutBorder: '#DCDCDC',
        black: '#000',
        inputBorder: '#D7DFE2',
      },

      screens: {
        '3xl': { min: '2500px' },
        '4xl': { min: '2700px' },

        '-2xl': { max: '1600px' },
        // => @media (max-width: 1600px) { ... }
        '2lx': { max: '1700' },

        '-2l': { min: '1500' },
        // => @media (max-width: 1600px) { ... }

        '-xl': { max: '1400px' },
        // => @media (max-width: 1400px) { ... }

        '-lg': { max: '1023px' },
        // => @media (max-width: 1023px) { ... }

        '-md': { max: '767px' },
        // => @media (max-width: 767px) { ... }

        '-sm': { max: '639px' },
        // => @media (max-width: 639px) { ... }
        '-xs': { max: '480px' },

        xs: { min: '481px' },
        '-2xs': { max: '370px' },
        '-3xs': { max: '330px' },
        // => @media (max-width: 420px) { ... }
      },
      fontSize: {
        price: '1.5rem',
        description: '0.875rem',
      },
    },
  },
};
