import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEvent } from '@/hooks/query/useQueryBase'
import { useUserRelays } from '@/hooks/query/useQueryUser'
import { useSeen } from '@/hooks/query/useSeen'
import { READ, WRITE } from '@/nostr/types'
import { compactArray } from '@/utils/utils'
import type { NostrEvent } from 'nostr-tools'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'
import { useContextSelector } from 'use-context-selector'
import type { EditorContextType } from '../EditorProvider'
import { EditorContext } from '../EditorProvider'

export function useEditorSelector<Selector>(selector: (value: EditorContextType) => Selector) {
  return useContextSelector(EditorContext, (ctx) => {
    if (!ctx) {
      throw new Error('useEditor must be used within EditorProvider')
    }
    return selector(ctx)
  })
}

export function useEditorSection() {
  const section = useEditorSelector((editor) => editor.section)
  const openSection = useEditorSelector((editor) => editor.openSection)
  return { section, openSection }
}

export function usePublicMessageTags(pubkey: string | undefined, event?: NostrEventDB | undefined) {
  const eventHeadRelay = useSeen(event?.id || '').data?.[0]?.relay || ''
  const userRelays = useUserRelays(pubkey, WRITE)
  const userHeadRelay = userRelays.data?.[0]?.relay || ''
  if (pubkey) {
    const tags = [['p', pubkey, userHeadRelay]]
    if (event) {
      tags.push(['q', event.id, eventHeadRelay])
    }
    return compactArray(tags)
  }
  return []
}

export function useReplyTags(event: NostrEventDB | undefined) {
  const eventRelays = useSeen(event?.id || '').data
  const userRelays = useUserRelays(event?.pubkey, WRITE)

  const eventHeadRelay = eventRelays?.[0]?.relay || ''
  const userHeadRelay = userRelays.data?.[0]?.relay || ''

  const rootEvent = useEvent(event?.metadata?.rootId).data
  const rootEventHeadRelay = useSeen(event?.metadata?.rootId || '').data?.[0]?.relay || ''
  const rootUserHeadRelay = useUserRelays(rootEvent?.pubkey, WRITE)?.data?.[0]?.relay || ''

  if (event) {
    switch (event.kind) {
      case Kind.Text: {
        // NIP-10 reply tags
        if (event.metadata?.isRoot) {
          return compactArray([
            ['e', event.id, eventHeadRelay, 'root', event.pubkey],
            ['p', event.pubkey, userHeadRelay],
          ])
        }
        const tags = [
          event.metadata?.rootId
            ? ['e', event.metadata?.rootId, rootEventHeadRelay || '', 'root', rootEvent?.pubkey]
            : [],
          ['e', event.id, eventHeadRelay || '', 'reply', event.pubkey],
          ['p', event.pubkey, userHeadRelay],
        ]
        return compactArray(tags)
      }
      default: {
        // NIP-22 comments tags
        const tags = [] as NostrEvent['tags']
        if (rootEvent) {
          tags.push(
            ...[
              ['E', rootEvent.id, rootEventHeadRelay || '', rootEvent?.pubkey],
              ['K', rootEvent.kind.toString()],
              ['P', rootEvent.pubkey, rootUserHeadRelay || ''],
            ],
          )
          if (isParameterizedReplaceableKind(rootEvent.kind)) {
            const dTag = rootEvent.tags.find((tag) => tag[0] === 'd')?.[1]
            const address = [rootEvent.id, rootEvent.pubkey, dTag].join(':')
            tags.unshift(['A', address, rootEventHeadRelay || '', rootEvent?.pubkey])
          }
        } else {
          tags.push(
            ...[
              ['E', event.id, eventHeadRelay || '', event.pubkey],
              ['K', event.kind.toString()],
              ['P', event.pubkey, userHeadRelay || ''],
            ],
          )
          if (isParameterizedReplaceableKind(event.kind)) {
            const dTag = event.tags.find((tag) => tag[0] === 'd')?.[1]
            const address = [event.id, event.pubkey, dTag].join(':')
            tags.unshift(['A', address, eventHeadRelay || '', event.pubkey])
          }
        }
        tags.push(
          ...[
            ['e', event.id, eventHeadRelay || '', event.pubkey],
            ['k', event.kind.toString()],
            ['p', event.pubkey],
          ],
        )
        return compactArray(tags)
      }
    }
  }
  return []
}
