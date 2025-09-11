import { Provider } from 'jotai'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { store } from './atoms/store'
import { ContentProvider } from './components/providers/ContentProvider'
import { QueryProvider } from './components/providers/QueryProvider'
import { StylexProvider } from './components/providers/StylexProvider'
import { queryClient } from './hooks/query/queryClient'
import './styles/stylex.css'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './Router'

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <QueryProvider client={queryClient}>
      <StylexProvider>
        <ContentProvider value={{}}>
          <RouterProvider router={router} context={{ queryClient }} />
        </ContentProvider>
      </StylexProvider>
    </QueryProvider>
  </Provider>,
)
