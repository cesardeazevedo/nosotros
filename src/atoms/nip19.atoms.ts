import { userRelaysQueryOptions } from '@/hooks/query/useQueryUser'
import { seenQueryOptions } from '@/hooks/query/useSeen'
import { WRITE } from '@/nostr/types'
import { encodeSafe } from '@/utils/nip19'
import { atom } from 'jotai'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import { nip19 } from 'nostr-tools'

const userRelaysQueryFamily = atomFamily((pubkey: string | undefined) => {
  return atomWithQuery(() => userRelaysQueryOptions(pubkey, WRITE))
})

export const nprofileFamily = atomFamily((pubkey: string | undefined) => {
  return atom((get) => {
    if (!pubkey) return undefined

    const relaysAtom = userRelaysQueryFamily(pubkey)
    const relaysQuery = get(relaysAtom)
    const relays = relaysQuery.data?.map((x) => x.relay).slice(0, 4) || []

    return encodeSafe(() => nip19.nprofileEncode({ pubkey, relays }))
  })
})

const seenQueryFamily = atomFamily((eventId: string | undefined) => {
  return atomWithQuery(() => seenQueryOptions(eventId))
})

export const neventFamily = atomFamily(
  (params: { eventId: string; pubkey: string; kind: number }) => {
    return atom((get) => {
      const { eventId, pubkey, kind } = params

      const seenAtom = seenQueryFamily(eventId)
      const seenQuery = get(seenAtom)
      const relays = seenQuery.data?.map((x) => x.relay).slice(0, 4) || []

      return encodeSafe(() =>
        nip19.neventEncode({
          id: eventId,
          author: pubkey,
          kind,
          relays,
        }),
      )
    })
  },
  (a, b) => a.eventId === b.eventId,
)

export const naddrFamily = atomFamily(
  (params: { kind: number; pubkey: string; identifier: string }) => {
    return atom((get) => {
      const { kind, pubkey, identifier } = params

      const relaysAtom = userRelaysQueryFamily(pubkey)
      const relaysQuery = get(relaysAtom)
      const relays = relaysQuery.data?.map((x) => x.relay).slice(0, 4) || []

      return encodeSafe(() =>
        nip19.naddrEncode({
          kind,
          pubkey,
          identifier,
          relays,
        }),
      )
    })
  },
  (a, b) => a.kind === b.kind && a.pubkey === b.pubkey && a.identifier === b.identifier,
)
