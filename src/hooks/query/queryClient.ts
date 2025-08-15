import { QueryClient } from '@tanstack/react-query'
import { prepopulate } from './queryUtils'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  },
})

prepopulate()
