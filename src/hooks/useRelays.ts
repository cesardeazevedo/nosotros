import { authRelaysAtom, connectedRelaysAtom, relaysAtom } from '@/atoms/relay.atoms'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { atom, useAtomValue } from 'jotai'

export function useActiveRelays() {
  return Object.values(useAtomValue(relaysAtom))
}

export function useConnectedRelays() {
  return useAtomValue(connectedRelaysAtom)
}

export function useAuthRequiredRelays() {
  return Object.values(useAtomValue(authRelaysAtom))
}

export function useRelay(_url: string) {
  const url = formatRelayUrl(_url)
  return useAtomValue(
    atom((get) => {
      return get(relaysAtom)[url]
    }),
  )
}
