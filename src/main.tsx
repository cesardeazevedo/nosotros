import { RouterProvider } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'
import { ContentProvider } from './components/providers/ContentProvider'
import { RootStoreProvider } from './components/providers/RootStoreProvider'
import { StylexProvider } from './components/providers/StylexProvider'
import { router } from './Router'
import { rootStore } from './stores/root.store'
import './styles/stylex.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StylexProvider>
    <RootStoreProvider>
      <ContentProvider value={{}}>
        <RouterProvider router={router} context={{ rootStore }} />
      </ContentProvider>
    </RootStoreProvider>
  </StylexProvider>,
)
