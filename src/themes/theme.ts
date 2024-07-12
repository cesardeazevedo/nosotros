import { Zoom, alpha, experimental_extendTheme as extendTheme } from '@mui/material'
import { common } from '@mui/material/colors'
import shadows, { type Shadows } from '@mui/material/styles/shadows'
import type {} from '@mui/material/themeCssVarsAugmentation'

const primary = {
  main: '#0066e2', // blue
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
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0, 0, 0, 0.14), 0px 1px 1px 0px rgba(0, 0, 0, 0.10), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)',
    ...shadows.slice(2),
  ] as Shadows,
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
          backdropFilter: 'blur(6px)',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: 'inherit',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        color: 'info',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          whiteSpace: 'nowrap',
        },
        outlinedInfo: {
          border: '1px solid',
          borderColor: 'var(--mui-palette-divider)',
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
        root: {
          border: 'none',
        },
        standardSuccess: {},
      },
    },
    MuiPaper: {
      defaultProps: {
        variant: 'elevation',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          ...(theme.palette.mode === 'dark' && {
            border: '1px solid var(--mui-palette-divider)',
          }),
        }),
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
        background: {
          default: common.black,
          paper: common.black,
        },
        AppBar: {
          darkBg: common.black,
        },
      },
    },
  },
})

export default theme
