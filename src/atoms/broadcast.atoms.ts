import type { Signer } from '@/core/signers/signer'
import { dbSqlite } from '@/nostr/db'
import { broadcastEvent } from '@/nostr/publish/publish'
import { atom } from 'jotai'
import type { NostrEvent } from 'nostr-tools'
import { merge, shareReplay, take, tap } from 'rxjs'

export type BroadcastRequest = {
  event: NostrEvent
  relays: string[] | undefined
  signer: Signer
  status: 'pending' | 'broadcasting' | 'done' | 'cancelled'
  timerId: NodeJS.Timeout
  onCancel?: () => void
  onComplete?: () => void
}

export const broadcastsRequestsAtom = atom<Map<string, BroadcastRequest>>(new Map())

export const getBroadcastRequestAtom = (id: string) => atom((get) => get(broadcastsRequestsAtom).get(id))

export const addBroadcastRequestAtom = atom(
  null,
  (get, set, request: Omit<BroadcastRequest, 'status' | 'timestamp' | 'timerId'> & { countdownMs?: number }) => {
    const { countdownMs = 5000, ...rest } = request
    const { id: eventId } = request.event

    const timerId = setTimeout(() => {
      const current = get(broadcastsRequestsAtom).get(eventId)
      if (current) {
        const { event, relays } = current
        set(updateBroadcastStatusAtom, { eventId, status: 'broadcasting' })
        merge(
          broadcastEvent(event, { relays }).pipe(
            shareReplay(),
            take(1),
            tap(() => {
              request.onComplete?.()
              set(updateBroadcastStatusAtom, { eventId, status: 'done' })
            }),
          ),
        ).subscribe()
      }
    }, countdownMs)

    const broadcasts = new Map(get(broadcastsRequestsAtom))
    broadcasts.set(request.event.id, {
      ...rest,
      timerId,
      status: 'pending',
    })
    set(broadcastsRequestsAtom, broadcasts)
  },
)

export const cancelBroadcastRequestAtom = atom(null, (get, set, eventId: string) => {
  const broadcasts = new Map(get(broadcastsRequestsAtom))
  const request = broadcasts.get(eventId)

  if (request) {
    request.onCancel?.()
    clearTimeout(request.timerId)
    set(removeBroadcastRequestAtom, eventId)
    dbSqlite.deleteEvent(eventId)
  }
})

export const updateBroadcastStatusAtom = atom(
  null,
  (get, set, params: { eventId: string; status: BroadcastRequest['status'] }) => {
    const { status, eventId } = params
    const broadcasts = new Map(get(broadcastsRequestsAtom))
    const request = broadcasts.get(eventId)
    if (request) {
      broadcasts.set(params.eventId, { ...request, status })
      set(broadcastsRequestsAtom, broadcasts)
    }
  },
)

export const removeBroadcastRequestAtom = atom(null, (get, set, eventId: string) => {
  const broadcasts = new Map(get(broadcastsRequestsAtom))
  broadcasts.delete(eventId)
  set(broadcastsRequestsAtom, broadcasts)
})
