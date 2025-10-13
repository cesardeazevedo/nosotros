import { store } from '@/atoms/store'
import type { QueryClient } from '@tanstack/react-query'
import { Provider } from 'jotai'
import { queryClientAtom } from 'jotai-tanstack-query'
import { useHydrateAtoms } from 'jotai/utils'

type Props = {
  client: QueryClient
  children: React.ReactNode
}

const HydrateAtoms = ({ children, client }: Props) => {
  useHydrateAtoms([[queryClientAtom, client]])
  return <>{children}</>
}

export const JotaiProvider = (props: Props) => {
  return (
    <Provider store={store}>
      <HydrateAtoms client={props.client}>{props.children}</HydrateAtoms>
    </Provider>
  )
}
