import { CssBaseline, Experimental_CssVarsProvider as CssVarsProvider, useColorScheme } from '@mui/material'
import { addons } from '@storybook/addons'
import type { PartialStoryFn } from '@storybook/csf'
import type { Preview, ReactRenderer } from '@storybook/react'
import { RootRoute, Route, Router, RouterProvider } from '@tanstack/react-router'
import React, { useEffect, useState } from 'react'
import { dbBatcher } from '../src/stores/db/observabledb.store'
import { RootStore, StoreProvider } from '../src/stores/index'

import { database } from '../src/stores/db/database.store'
import theme from '../src/themes/theme'

const channel = addons.getChannel()

const App = (props: { Story: PartialStoryFn<ReactRenderer>; store: RootStore }) => {
  const { setMode } = useColorScheme()
  const { Story, store } = props
  const [ready, setReady] = useState(false)

  useEffect(() => {
    channel.on('DARK_MODE', (dark) => setMode(dark ? 'dark' : 'light'))
    return () => channel.off('DARK_MODE', () => setMode('light'))
  }, [channel, setMode])

  useEffect(() => {
    dbBatcher._subject.complete()
    database.initialize()
    database.clear().then(() => setReady(true))
  }, [])

  return ready && <Story globals={{ store }} />
}

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const store = new RootStore()
      const rootRoute = new RootRoute({
        component: () => <App Story={Story} store={store} />,
      })
      const index = new Route({ getParentRoute: () => rootRoute, path: '/' })
      const routeTree = rootRoute.addChildren([index])
      const router = new Router({ routeTree })
      context.parameters.setup?.(store)
      return (
        <StoreProvider value={store}>
          <CssVarsProvider theme={theme}>
            <CssBaseline />
            <RouterProvider router={router} />
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
}

export default preview
