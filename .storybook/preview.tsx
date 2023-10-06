import { CssBaseline, Experimental_CssVarsProvider as CssVarsProvider, useColorScheme } from '@mui/material'
import { addons } from '@storybook/addons'
import type { PartialStoryFn } from '@storybook/csf'
import type { Preview, ReactRenderer } from '@storybook/react'
import { themes } from '@storybook/theming'
import React, { useEffect } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { RootStore, StoreProvider } from '../src/stores'

import theme from '../src/themes/theme'

const channel = addons.getChannel()

const App = (props: { Story: PartialStoryFn<ReactRenderer, { [x: string]: any }>; store: RootStore }) => {
  const { setMode } = useColorScheme()
  const { Story, store } = props

  useEffect(() => {
    channel.on('DARK_MODE', (dark) => setMode(dark ? 'dark' : 'light'))
    return () => channel.off('DARK_MODE', () => setMode('light'))
  }, [channel, setMode])

  return <Story globals={{ store }} />
}

const { dark, light } = theme.colorSchemes

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const store = new RootStore()
      return (
        <StoreProvider value={store}>
          <CssVarsProvider theme={theme}>
            <CssBaseline />
            <RouterProvider
              router={createBrowserRouter([{ path: '*', element: <App Story={Story} store={store} /> }])}
            />
          </CssVarsProvider>
        </StoreProvider>
      )
    },
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'fullscreen',
  },
  // @ts-ignore
  darkMode: {
    light: {
      ...themes.normal,
      appBg: '#fff',
      colorPrimary: light.palette.secondary.main,
      colorSecondary: light.palette.primary.main,
      base: 'light',
      brandTitle: 'Nostr',
      brandUrl: '',
      brandImage: '',
    },
    dark: {
      ...themes.dark,
      appBg: dark.palette.background.default,
      barBg: dark.palette.background.paper,
      appContentBg: dark.palette.background.paper,
      appBorderColor: dark.palette.divider,
      inputBg: dark.palette.background.paper,
      inputBorder: dark.palette.divider,
      colorPrimary: dark.palette.primary.main,
      colorSecondary: dark.palette.primary.main,
      base: 'light',
      brandTitle: 'Nostr',
      brandUrl: '',
      brandImage: '',
    },
  },
}

export default preview
