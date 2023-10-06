import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { CssBaseline, Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material'
import ReactDOM from 'react-dom/client'
import { StoreProvider, store } from 'stores'

import theme from 'themes/theme'

import React from 'react'
import App from './App'

Bugsnag.start({
  apiKey: process.env.BUGSNAG_API_KEY as string,
  plugins: [new BugsnagPluginReact()],
  enabledReleaseStages: ['production'],
})

const ErrorBoundary = Bugsnag.getPlugin('react')?.createErrorBoundary(React) || React.Fragment

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
