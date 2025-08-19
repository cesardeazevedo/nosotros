import type { Nip05DB } from '@/db/types'
import { dbSqlite } from '@/nostr/db'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

export type Nip05Response = {
  names?: Record<string, string>
  relays?: Record<string, string[]>
}

export function nip05QueryOptions(nip05: string = ''): UseQueryOptions<Nip05DB | undefined> {
  const [name, host] = nip05.split('@')
  return {
    queryKey: ['nip05', nip05] as const,
    enabled: !!nip05,
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
      const nip05 = (await res.json()) as Nip05Response
      // Insert all names found
      Object.entries(nip05.names || {}).forEach(([username, pubkey]) => {
        dbSqlite.insertNip05({
          nip05: `${username}@${host}`,
          pubkey,
          relays: nip05.relays?.[pubkey] || [],
          timestamp: Date.now(),
        })
      })
      const pubkey = nip05.names?.[name]
      const relays = pubkey ? nip05.relays?.[pubkey] || [] : []
      if (pubkey) {
        return {
          nip05,
          pubkey,
          relays,
          timestamp: Date.now(),
        } as Nip05DB
      }
      return undefined
    },
  }
}

export function useNip05(pubkey: string, nip05: string | undefined) {
  return useQuery({
    ...nip05QueryOptions(nip05),
    select: (res) => {
      return res ? res.pubkey === pubkey : undefined
    },
  })
}
