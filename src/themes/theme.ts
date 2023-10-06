import { Zoom, alpha, experimental_extendTheme as extendTheme } from '@mui/material'
import { common } from '@mui/material/colors'
import type {} from '@mui/material/themeCssVarsAugmentation'

const primary = {
  main: '#2196f3', // blue
  // main: "#FA5733", // orange
  // main: 'rgb(255, 0, 127)', // pink
  // main: '#7a04eb', // purple
}

const theme = extendTheme({
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        :root {
          --sat: env(safe-area-inset-top);
          --sar: env(safe-area-inset-right);
          --sab: env(safe-area-inset-bottom);
          --sal: env(safe-area-inset-left);
        }
      `,
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderTop: 0,
          borderLeft: 0,
          borderRight: 0,
          backdropFilter: 'blur(4px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          whiteSpace: 'nowrap',
        },
      },
    },
    MuiLink: {
      defaultProps: {
        color: 'inherit',
        underline: 'hover',
        fontWeight: 600,
      },
    },
    MuiTooltip: {
      defaultProps: {
        TransitionComponent: Zoom,
      },
      styleOverrides: {
        arrow: {
          color: '#000',
        },
        tooltip: {
          backgroundColor: '#000',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          border: '1px solid',
          borderColor: 'var(--mui-palette-success-light)',
        },
      },
    },
  },
  colorSchemes: {
    light: {
      palette: {
        primary,
        info: {
          main: '#000',
        },
        dividerSolid: '#e0e0e0',
        background: {
          default: '#F1F3F6',
        },
        AppBar: {
          defaultBg: alpha(common.white, 0.85),
        },
        Alert: {
          infoIconColor: primary.main,
        },
      },
    },
    dark: {
      palette: {
        primary,
        info: {
          main: '#fff',
        },
        dividerSolid: '#393939',
        background: {},
        AppBar: {
          darkBg: alpha(common.black, 0.9),
        },
      },
    },
  },
})

export default theme
