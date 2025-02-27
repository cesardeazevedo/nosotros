import { RouterProvider } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'
import { ContentProvider } from './components/providers/ContentProvider'
import { NostrProvider } from './components/providers/NostrProvider'
import { RootStoreProvider } from './components/providers/RootStoreProvider'
import { StylexProvider } from './components/providers/StylexProvider'
import { router } from './Router'
import { rootStore } from './stores/root.store'
import './styles/stylex.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StylexProvider>
    <RootStoreProvider>
      <NostrProvider nostrContext={() => rootStore.rootContext} subFollows subNotifications>
        <ContentProvider value={{}}>
          <RouterProvider router={router} />
        </ContentProvider>
      </NostrProvider>
    </RootStoreProvider>
  </StylexProvider>,
)
