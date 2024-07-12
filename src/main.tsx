import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { CssBaseline, Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material'
import { RouterProvider } from '@tanstack/react-router'
import GlobalStyles from 'components/elements/Layouts/GlobalStyles'
import React from 'react'
import ReactDOM from 'react-dom/client'
import theme from 'themes/theme'
import { router } from './Router'

const bugsnagApiKey = import.meta.env.VITE_BUGSNAG_API_KEY

if (bugsnagApiKey) {
  Bugsnag.start({
    apiKey: bugsnagApiKey as string,
    plugins: [new BugsnagPluginReact()],
    enabledReleaseStages: ['production'],
  })
}

const BugsnagErrorBoundary = bugsnagApiKey
  ? Bugsnag.getPlugin('react')?.createErrorBoundary(React) || React.Fragment
  : React.Fragment

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BugsnagErrorBoundary>
    <CssVarsProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles />
      <RouterProvider router={router} />
    </CssVarsProvider>
  </BugsnagErrorBoundary>,
)
