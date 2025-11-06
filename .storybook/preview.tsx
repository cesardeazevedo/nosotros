import type { Preview, ReactRenderer } from '@storybook/react-vite'
import { createRootRouteWithContext, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { DARK_MODE_EVENT_NAME } from '@vueless/storybook-dark-mode'
import { Provider } from 'jotai'
import React, { useEffect } from 'react'
import type { PartialStoryFn } from 'storybook/internal/csf'
import { addons } from 'storybook/preview-api'
import { themes } from 'storybook/theming'
import { store } from '../src/atoms/store'
import { Dialogs } from '../src/components/modules/DialogsModule'
import { ContentProvider } from '../src/components/providers/ContentProvider'
import { QueryProvider } from '../src/components/providers/QueryProvider'
import { StylexProvider } from '../src/components/providers/StylexProvider'
import { queryClient } from '../src/hooks/query/queryClient'
import { useSetSettings } from '../src/hooks/useSettings'
import '../src/styles/stylex.css'

const channel = addons.getChannel()

// Initialize MSW
initialize()

// eslint-disable-next-line react-refresh/only-export-components
const App = (props: { Story: PartialStoryFn<ReactRenderer> }) => {
  const { Story } = props
  const setSettings = useSetSettings()

  useEffect(() => {
    channel.on(DARK_MODE_EVENT_NAME, (dark) => setSettings({ theme: dark ? 'dark' : 'light' }))
    return () => channel.off(DARK_MODE_EVENT_NAME, () => setSettings({ theme: 'light' }))
  }, [channel])

  return (
    <>
      <Dialogs />
      <Story />
    </>
  )
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader],
  // @ts-ignore
  darkMode: {
    dark: { ...themes.dark, appBg: '#000000' },
    light: { ...themes.normal, appBg: '#f8f9fa' },
  },

  decorators: [
    (Story) => {
      const rootRoute = createRootRouteWithContext()({
        component: () => <App Story={Story} />,
      })
      const index = createRoute({ getParentRoute: () => rootRoute, path: '/' })
      const routeTree = rootRoute.addChildren([index])
      const router = createRouter({ routeTree })

      return (
        <Provider store={store}>
          <QueryProvider client={queryClient}>
            <StylexProvider>
              <ContentProvider value={{}}>
                {/* <App Story={Story} /> */}
                <RouterProvider router={router} context={{ queryClient }} />
              </ContentProvider>
            </StylexProvider>
          </QueryProvider>
        </Provider>
      )
    },
  ],
}

export default preview
