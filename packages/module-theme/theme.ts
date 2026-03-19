import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { CSSProperties } from 'react';
import 'typeface-poppins';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xxl: true;
    medium: true;
    container: true;
    large: true;
  }
}
declare module '@mui/material/styles' {
  interface TypographyVariants {
    filter: CSSProperties;
    OverallRating: CSSProperties;
    ProcessStep: CSSProperties;
    ProfileName: CSSProperties;
    CartItemPrice: CSSProperties;
    ErrorHeading: CSSProperties;
    ErrorSubHeading: CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    filter?: CSSProperties;
    OverallRating: CSSProperties;
    ProcessStep: CSSProperties;
    ProfileName: CSSProperties;
    CartItemPrice: CSSProperties;
    ErrorHeading: CSSProperties;
    ErrorSubHeading: CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    filter: true;
    OverallRating: true;
    ProcessStep: true;
    ProfileName: true;
    CartItemPrice: true;
    ErrorHeading: true;
    ErrorSubHeading: true;
  }
}
declare module '@mui/material/styles' {
  interface ThemeColorOptions {
    bgColor: string;
    borderColor: string;
    bgColorDark: string;
  }
  interface Palette {
    customGrey: Palette['grey'];
    themeAdditional: ThemeColorOptions;
  }

  interface PaletteOptions {
    customGrey: PaletteOptions['grey'];
    themeAdditional: ThemeColorOptions;
  }
}

let theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          paddingBlock: '0.75rem',
          fontSize: '1rem',
          fontWeight: '600',
          boxShadow: 'unset',
          borderRadius: '0',
          verticalAlign: 'none',
        },
        contained: {
          verticalAlign: 'none',
          paddingBlock: '0.8125rem',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#ffc930',
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        root: {
          color: '#ffc930',
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: '#D8D8D8',
          height: '0.4375rem',
          borderRadius: '0.25rem',
        },
        barColorPrimary: ({ ownerState }) => ({
          backgroundColor: getProgressColor(ownerState.value),
        }),
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '0.5rem 0.25rem 1rem',
        },
      },
    },
  },

  palette: {
    primary: {
      main: '#115E59',
      dark: '#277d60',
      light: '#5cd97f',
      contrastText: '#ffffff',
    },
    themeAdditional: {
      bgColor: '#f9f9f9',
      bgColorDark: '#373d3f',
      borderColor: '#ececec',
    },
    secondary: {
      main: '#2c3145',
      light: '#565a6a',
      dark: '#1e2230',
    },
    error: {
      main: '#d32f2f',
      light: '#e85115',
      dark: '#e70e12',
    },
    customGrey: {
      [500]: '#989898',
      [700]: '#676767',
      [400]: '#d2d2d2',
    },
  },
  typography: {
    fontFamily: 'Lexend',
    h6: {
      fontSize: '2rem',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: '700',
    },
    h4: {
      fontSize: '1.375rem',
      fontWeight: '700',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: '400',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 'bold',
    },
    subtitle2: {
      fontSize: '1rem',
      fontWeight: '700',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '1rem',
      color: '#64687A',
    },
    button: {
      color: '#989898',
      textTransform: 'capitalize',
      fontSize: '1rem',
      borderRadius: '0px',
    },
    caption: {
      color: '#d2d2d2',
      fontSize: '1rem',
    },
    overline: {
      color: '#676767',
      textTransform: 'capitalize',
      fontSize: '1rem',
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      fontWeight: 500,
    },
    filter: {
      fontSize: '1rem',
    },
    OverallRating: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    ProcessStep: {
      fontSize: '4.5rem',
      fontWeight: 700,
    },
    ProfileName: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    CartItemPrice: {
      fontSize: '1.125rem',
      fontWeight: 400,
    },
    ErrorHeading: {
      fontSize: '1.875rem',
      fontWeight: 700,
    },
    ErrorSubHeading: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
  },

  breakpoints: {
    values: {
      xs: 0,
      sm: 639,
      md: 768,
      lg: 1023,
      large: 1280,
      medium: 1300,
      xl: 1440,
      xxl: 1600,

      container: 2000,
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;

export const getProgressColor = (value: number | undefined) => {
  if (value) {
    if (value <= 5) {
      return theme.palette.error.main; // Change for values <= 5
    } else if (value <= 15) {
      return theme.palette.error.light; // Change for values <= 15
    } else if (value <= 25) {
      return theme.palette.primary.light; // Change for values <= 25
    } else if (value <= 50) {
      return theme.palette.primary.main; // Change for values > 50
    }
  }
};
