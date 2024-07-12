import { CssBaseline, Experimental_CssVarsProvider as CssVarsProvider, useColorScheme } from '@mui/material'
import { addons } from '@storybook/addons'
import type { PartialStoryFn } from '@storybook/csf'
import type { Preview, ReactRenderer } from '@storybook/react'
import { createRootRouteWithContext, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import React, { useEffect, useState } from 'react'
import { storage } from '../src/nostr/storage'

import theme from '../src/themes/theme'

const channel = addons.getChannel()

const App = (props: { Story: PartialStoryFn<ReactRenderer> }) => {
  const { setMode } = useColorScheme()
  const { Story } = props
  const [ready, setReady] = useState(false)

  useEffect(() => {
    channel.on('DARK_MODE', (dark) => setMode(dark ? 'dark' : 'light'))
    return () => channel.off('DARK_MODE', () => setMode('light'))
  }, [channel, setMode])

  useEffect(() => {
    storage.clearDB().then(() => setReady(true))
  }, [])

  return ready && <Story />
}

const preview: Preview = {
  decorators: [
    (Story) => {
      const rootRoute = createRootRouteWithContext()({
        component: () => <App Story={Story} />,
      })
      const index = createRoute({ getParentRoute: () => rootRoute, path: '/' })
      const routeTree = rootRoute.addChildren([index])
      const router = createRouter({ routeTree })
      return (
        <CssVarsProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </CssVarsProvider>
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
}

export default preview
