import { useQuery } from '@tanstack/react-query'

export type Nip05Response = {
  names?: Record<string, string>
  relays?: Record<string, string[]>
}

export function nip05QueryOptions(nip05: string) {
  const [name, host] = nip05.split('@')
  return {
    queryKey: ['nip05', nip05] as const,
    queryFn: async () => {
      const url = `https://${host}/.well-known/nostr.json?name=${name}`
      const res = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        priority: 'low',
      })
      if (!res.ok) {
        throw new Error('Failed to fetch NIP-05 record')
      }
      return (await res.json()) as Nip05Response
    },
  }
}

export function useNip05(nip05: string) {
  return useQuery(nip05QueryOptions(nip05))
}
