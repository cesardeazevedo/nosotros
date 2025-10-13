import { RouterProvider } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { ContentProvider } from './components/providers/ContentProvider'
import { JotaiProvider } from './components/providers/JotaiProvider'
import { QueryProvider } from './components/providers/QueryProvider'
import { StylexProvider } from './components/providers/StylexProvider'
import { queryClient } from './hooks/query/queryClient'
import { router } from './Router'
import './styles/stylex.css'

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryProvider client={queryClient}>
    <JotaiProvider client={queryClient}>
      <StylexProvider>
        <ContentProvider value={{}}>
          <RouterProvider router={router} context={{ queryClient }} />
        </ContentProvider>
      </StylexProvider>
    </JotaiProvider>
  </QueryProvider>,
)
