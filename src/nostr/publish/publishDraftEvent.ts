import { store } from '@/atoms/store'
import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { ToastDraftSaved } from '@/components/elements/Toasts/ToastDraftSaved'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryClient } from '@/hooks/query/queryClient'
import { queryKeys } from '@/hooks/query/queryKeys'
import { getDTag } from '@/utils/nip19'
import type { EventTemplate } from 'nostr-tools'
import { createElement } from 'react'
import { lastValueFrom, tap } from 'rxjs'
import type { LocalPublisherOptions } from './publish'
import { publish } from './publish'
import { publishDeleteRequest } from './publishDeleteRequest'

type DraftWrapEventPayload = {
  pubkey: string
  identifier: string
  draftKind: number
  encryptedContent: string
  expirationSec: number
}

const DRAFT_EXPIRATION_SEC = 60 * 60 * 24 * 90

export const createDraftIdentifier = (identifier?: string) => {
  return identifier || window.crypto.randomUUID().replace(/-/g, '').slice(0, 21)
}

const getDraftWrapEvent = (payload: DraftWrapEventPayload) => ({
  pubkey: payload.pubkey,
  kind: Kind.DraftWrap,
  tags: [
    ['d', payload.identifier],
    ['k', String(payload.draftKind)],
    ['expiration', String(payload.expirationSec)],
  ],
  content: payload.encryptedContent,
})

const isSameDraft = (target: NostrEventDB) => (event: NostrEventDB) => {
  return event.kind === Kind.DraftWrap && event.pubkey === target.pubkey && getDTag(event) === getDTag(target)
}

const setDraftQueryData = (pubkey: string, event: NostrEventDB) => {
  queryClient.setQueryData<NostrEventDB[]>(queryKeys.author(pubkey, Kind.DraftWrap), (current = []) => {
    const next = current.filter((item) => !isSameDraft(event)(item))
    return [event, ...next]
  })

  const identifier = getDTag(event)
  if (identifier) {
    queryClient.setQueryData<NostrEventDB[]>(
      queryKeys.addressable(Kind.DraftWrap, pubkey, identifier),
      (current = []) => [event, ...current.filter((item) => item.id !== event.id)],
    )
  }
}

const removeDraftQueryData = (pubkey: string, event: NostrEventDB) => {
  queryClient.setQueryData<NostrEventDB[]>(queryKeys.author(pubkey, Kind.DraftWrap), (current = []) => {
    return current.filter((item) => !isSameDraft(event)(item))
  })

  const identifier = getDTag(event)
  if (identifier) {
    queryClient.setQueryData<NostrEventDB[]>(
      queryKeys.addressable(Kind.DraftWrap, pubkey, identifier),
      (current = []) => current.filter((item) => item.id !== event.id),
    )
  }
}

export async function publishDraftEvent(
  pubkey: string,
  event: EventTemplate,
  identifier: string | undefined,
  options: LocalPublisherOptions,
) {
  if (!options.signer) {
    throw new Error('Signer not found')
  }

  const nextIdentifier = createDraftIdentifier(identifier)
  const encryptedContent = await options.signer.encrypt(pubkey, JSON.stringify(event))

  return await lastValueFrom(
    publish(
      getDraftWrapEvent({
        pubkey,
        identifier: nextIdentifier,
        draftKind: event.kind,
        encryptedContent,
        expirationSec: Math.floor(Date.now() / 1000) + DRAFT_EXPIRATION_SEC,
      }),
      {
        ...options,
        saveEvent: options.saveEvent ?? true,
      },
    ).pipe(
      tap((draftEvent) => {
        setDraftQueryData(pubkey, draftEvent)
        store.set(enqueueToastAtom, {
          component: createElement(ToastDraftSaved),
          duration: 5000,
        })
      }),
    ),
  )
}

export async function publishDraftDelete(
  pubkey: string,
  event: NostrEventDB,
  options: LocalPublisherOptions,
) {
  return await lastValueFrom(
    publishDeleteRequest(pubkey, event, {
      ...options,
      saveEvent: options.saveEvent ?? true,
    }).pipe(
      tap(() => {
        removeDraftQueryData(pubkey, event)
      }),
    ),
  )
}
