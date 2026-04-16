import type { Nip05DB } from '@/db/types'
import { dbSqlite } from '@/nostr/db'
import { isNamecoinIdentifier, resolveNamecoin } from '@/services/namecoin'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

export type Nip05Response = {
  names?: Record<string, string>
  relays?: Record<string, string[]>
}

/** Result type extended with Namecoin flag */
export type Nip05Result = Nip05DB & {
  isNamecoin?: boolean
}

function nip05QueryOptionsNamecoin(nip05: string): UseQueryOptions<Nip05Result | null> {
  return {
    queryKey: ['nip05', 'namecoin', nip05] as const,
    enabled: !!nip05,
    staleTime: 5 * 60 * 1000, // 5 min — Namecoin names change rarely
    queryFn: async () => {
      const result = await resolveNamecoin(nip05)
      if (!result) return null

      const nip05Record: Nip05Result = {
        nip05,
        pubkey: result.pubkey,
        relays: result.relays || [],
        timestamp: Date.now(),
        isNamecoin: true,
      }

      // Store in DB for offline access
      dbSqlite.insertNip05({
        nip05,
        pubkey: result.pubkey,
        relays: result.relays || [],
        timestamp: Date.now(),
      })

      return nip05Record
    },
  }
}

function nip05QueryOptionsStandard(nip05: string): UseQueryOptions<Nip05Result | null> {
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
      const nip05Response = (await res.json()) as Nip05Response
      // Insert all names found
      Object.entries(nip05Response.names || {}).forEach(([username, pubkey]) => {
        dbSqlite.insertNip05({
          nip05: `${username}@${host}`,
          pubkey,
          relays: nip05Response.relays?.[pubkey] || [],
          timestamp: Date.now(),
        })
      })
      const pubkey = nip05Response.names?.[name]
      const relays = pubkey ? nip05Response.relays?.[pubkey] || [] : []
      if (pubkey) {
        return {
          nip05,
          pubkey,
          relays,
          timestamp: Date.now(),
        } as Nip05Result
      }
      return null
    },
  }
}

export function nip05QueryOptions(nip05: string = ''): UseQueryOptions<Nip05Result | null> {
  if (isNamecoinIdentifier(nip05)) {
    return nip05QueryOptionsNamecoin(nip05)
  }
  return nip05QueryOptionsStandard(nip05)
}

export function useNip05(pubkey: string, nip05: string | undefined) {
  const isNmc = nip05 ? isNamecoinIdentifier(nip05) : false
  const queryOpts = nip05QueryOptions(nip05 || '')
  return useQuery({
    ...queryOpts,
    select: (res) => {
      if (!res) return undefined
      return {
        valid: res.pubkey === pubkey,
        isNamecoin: isNmc || res.isNamecoin === true,
      }
    },
  })
}
