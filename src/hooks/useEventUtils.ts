import { naddrFamily, neventFamily, nprofileFamily } from '@/atoms/nip19.atoms'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { IMetaFields } from '@/hooks/parsers/parseImeta'
import { getMimeType } from '@/hooks/parsers/parseImeta'
import { useAtomValue } from 'jotai'
import { isAddressableKind, isReplaceableKind } from 'nostr-tools/kinds'
import { useMemo } from 'react'
import { useSeen } from './query/useSeen'
import { useCurrentUser } from './useAuth'

export function useEventTag(event: NostrEventDB | undefined, tagName: string) {
  return useMemo(() => {
    return event?.tags.find((tag) => tag[0] === tagName)?.[1]
  }, [event?.tags, tagName])
}

export function useEventLastTag(event: NostrEventDB | undefined, tagName: string) {
  return useMemo(() => {
    return event?.tags.findLast((tag) => tag[0] === tagName)?.[1]
  }, [event?.tags, tagName])
}

export function useEventTags(event: NostrEventDB | undefined, tagName: string) {
  return useMemo(() => {
    return event?.tags.filter((tag) => tag[0] === tagName).map((tag) => tag[1]) || []
  }, [event?.tags, tagName])
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
    const isAddressable = isAddressableKind(kind)

    return isReplaceable ? [kind, pubkey].join(':') : isAddressable ? [kind, pubkey, d].join(':') : id
  }, [d])
}

export function useNevent(event: NostrEventDB | undefined) {
  return useAtomValue(
    neventFamily({
      eventId: event?.id || '',
      pubkey: event?.pubkey || '',
      kind: event?.kind || 0,
    }),
  )
}

export function useNprofile(pubkey: string = '') {
  return useAtomValue(nprofileFamily(pubkey))
}

export function useNaddress(event: NostrEventDB) {
  const d = useEventDTag(event)
  return useAtomValue(
    naddrFamily({
      kind: event?.kind || 0,
      pubkey: event?.pubkey || '',
      identifier: d || '',
    }),
  )
}

export function useNIP19(event: NostrEventDB) {
  const naddress = useNaddress(event)
  const nevent = useNevent(event)
  return isAddressableKind(event.kind) ? naddress : nevent
}

export function useImetaList(event: NostrEventDB | undefined) {
  return useMemo(() => {
    if (event?.metadata?.imeta && (event.kind === Kind.Media || event.kind === Kind.Video || event.kind === Kind.ShortVideo)) {
      return Object.entries(event?.metadata?.imeta)
        .map(([src, data]) => {
          const mime = getMimeType(src, data as IMetaFields)
          return [mime, src, data] as const
        })
        .filter((x): x is ['image' | 'video', string, IMetaFields] => x[0] === 'image' || x[0] === 'video')
    }
    return (
      event?.metadata?.contentSchema?.content
        .filter((x) => x.type === 'image' || x.type === 'video')
        .map((x) => [x.type, x.attrs.src as string, event.metadata?.imeta?.[x.attrs.src]] as const) || ([] as const)
    )
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
