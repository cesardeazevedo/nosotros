import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { RouterProvider } from '@tanstack/react-router'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { StylexProvider } from './components/providers/StylexProvider'
import { router } from './Router'
import './styles/stylex.css'

const bugsnagApiKey = import.meta.env.VITE_BUGSNAG_API_KEY

if (bugsnagApiKey) {
  Bugsnag.start({
    apiKey: bugsnagApiKey as string,
    plugins: [new BugsnagPluginReact()],
    enabledReleaseStages: ['production'],
  })
}

// eslint-disable-next-line react-refresh/only-export-components
const BugsnagErrorBoundary = bugsnagApiKey
  ? Bugsnag.getPlugin('react')?.createErrorBoundary(React) || React.Fragment
  : React.Fragment

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BugsnagErrorBoundary>
    <StylexProvider>
      <RouterProvider router={router} />
    </StylexProvider>
  </BugsnagErrorBoundary>,
)
