import { RouterProvider } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'
import { NostrProvider } from './components/providers/NostrProvider'
import { RootStoreProvider } from './components/providers/RootStoreProvider'
import { StylexProvider } from './components/providers/StylexProvider'
import './ReactotronConfig'
import { router } from './Router'
import { rootStore } from './stores/root.store'
import './styles/stylex.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StylexProvider>
    <RootStoreProvider>
      <NostrProvider nostrContext={() => rootStore.rootContext} subFollows>
        <RouterProvider router={router} />
      </NostrProvider>
    </RootStoreProvider>
  </StylexProvider>,
)
