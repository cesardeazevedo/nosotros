import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { IMetaFields } from '@/hooks/parsers/parseImeta'
import { getMimeType } from '@/hooks/parsers/parseImeta'
import { encodeSafe } from '@/utils/nip19'
import { nip19 } from 'nostr-tools'
import { isParameterizedReplaceableKind, isReplaceableKind } from 'nostr-tools/kinds'
import { useMemo } from 'react'
import { WRITE } from './parsers/parseRelayList'
import { useUserRelays } from './query/useQueryUser'
import { useSeen } from './query/useSeen'
import { useCurrentUser } from './useAuth'

export function useEventTag(event: NostrEventDB | undefined, tagName: string) {
  return useMemo(() => {
    return event?.tags.find((tag) => tag[0] === tagName)?.[1]
  }, [tagName])
}

export function useEventLastTag(event: NostrEventDB | undefined, tagName: string) {
  return useMemo(() => {
    return event?.tags.findLast((tag) => tag[0] === tagName)?.[1]
  }, [tagName])
}

export function useEventTags(event: NostrEventDB | undefined, tagName: string) {
  return useMemo(() => {
    return event?.tags.filter((tag) => tag[0] === tagName).map((tag) => tag[1]) || []
  }, [tagName])
}

export function useEventDTag(event: NostrEventDB) {
  return useEventTag(event, 'd')
}

export function useEventAltTag(event: NostrEventDB) {
  return useEventTag(event, 'alt')
}

export function useEventPowTag(event: NostrEventDB) {
  return useEventTag(event, 'pow')
}

export function useEventFirstTopicCurrentUserFollows(event: NostrEventDB) {
  const user = useCurrentUser()
  return useMemo(() => {
    return event.tags.filter(([tag]) => tag === 't').find(([tag, value]) => user.followsTag(value, tag))?.[1]
  }, [event, user])
}

export function useEventKey(event: NostrEventDB) {
  const d = useEventDTag(event)

  return useMemo(() => {
    const { id, kind, pubkey } = event
    const isReplaceable = isReplaceableKind(kind)
    const isAddressable = isParameterizedReplaceableKind(kind)

    return isReplaceable ? [kind, pubkey].join(':') : isAddressable ? [kind, pubkey, d].join(':') : id
  }, [d])
}

export function useNevent(event: NostrEventDB | undefined) {
  const relays = useEventRelays(event?.id).slice(0, 4)
  return useMemo(() => {
    return encodeSafe(() =>
      event
        ? nip19.neventEncode({
            id: event.id,
            author: event.pubkey,
            kind: event.kind,
            relays,
          })
        : undefined,
    )
  }, [event, relays])
}

export function useNprofile(pubkey: string = '') {
  const relays = useUserRelays(pubkey, WRITE)
    .data?.map((x) => x.relay)
    .slice(0, 4)
  return useMemo(
    () =>
      encodeSafe(() =>
        nip19.nprofileEncode({
          pubkey,
          relays,
        }),
      ),
    [pubkey, relays],
  )
}

export function useNaddress(event: NostrEventDB) {
  const d = useEventDTag(event)
  const relays = useEventRelays(event.id).slice(0, 4)
  if (d) {
    return encodeSafe(() =>
      nip19.naddrEncode({
        pubkey: event.pubkey,
        kind: event.kind,
        identifier: d,
        relays,
      }),
    )
  }
}

export function useImetaList(event: NostrEventDB | undefined) {
  return useMemo(() => {
    return Object.entries(event?.metadata?.imeta || {}).map(([src, data]) => {
      const mime = getMimeType(src, data as IMetaFields)
      return [mime, src, data] as const
    })
  }, [event])
}

export function useEventImages(event: NostrEventDB | undefined) {
  return useMemo(
    () => event?.metadata?.contentSchema?.content.filter((x) => x.type === 'image').map((x) => x.attrs.src) || [],
    [event],
  )
}

export function useEventHeadImage(event: NostrEventDB | undefined) {
  const images = useEventImages(event)
  return images ? images[0] : undefined
}

export function useEventRelays(eventId: string | undefined) {
  return useSeen(eventId || '').data?.map((x) => x.relay) || []
}
