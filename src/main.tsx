import { RouterProvider } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'
import { NostrProvider } from './components/providers/NostrProvider'
import { StylexProvider } from './components/providers/StylexProvider'
import { router } from './Router'
import './styles/stylex.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StylexProvider>
    <NostrProvider>
      <RouterProvider router={router} />
    </NostrProvider>
  </StylexProvider>,
)
