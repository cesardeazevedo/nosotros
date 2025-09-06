import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

type Props = {
  client: QueryClient
  children: React.ReactNode
}

export const QueryProvider = (props: Props) => {
  return <QueryClientProvider client={props.client}>{props.children}</QueryClientProvider>
}
