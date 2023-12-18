import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { CssBaseline, Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material'
import ReactDOM from 'react-dom/client'
import { StoreProvider, store } from 'stores'

import theme from 'themes/theme'

import React from 'react'
import App from './App'

const bugsnagApiKey = import.meta.env.VITE_BUGSNAG_API_KEY

if (bugsnagApiKey) {
  Bugsnag.start({
    apiKey: bugsnagApiKey as string,
    plugins: [new BugsnagPluginReact()],
    enabledReleaseStages: ['production'],
  })
}

const ErrorBoundary = bugsnagApiKey
  ? Bugsnag.getPlugin('react')?.createErrorBoundary(React) || React.Fragment
  : React.Fragment

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ErrorBoundary>
    <StoreProvider value={store}>
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        <App />
      </CssVarsProvider>
    </StoreProvider>
  </ErrorBoundary>,
)
