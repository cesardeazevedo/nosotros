import { Kind } from '@/constants/kinds'
import { NostrPublisher } from '@/core/NostrPublish'
import { auth } from '@/core/operators/auth'
import { RelayToClient } from '@/core/types'
import { EMPTY, filter, mergeMap, of, take, throwError } from 'rxjs'
import type { NostrClient } from './nostr'
import { pool } from './pool'

export function authenticate(client: NostrClient, relay: string, challenge: string) {
  if (!client.pubkey || !client.signer) {
    const error = 'Not authenticated'
    return throwError(() => new Error(error))
  }

  const publish = new NostrPublisher(
    {
      kind: Kind.ClientAuth,
      content: '',
      pubkey: client.pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['relay', relay],
        ['challenge', challenge],
      ],
    },
    {
      signer: client.signer,
      relays: of([relay]),
    },
  )
  return of(publish).pipe(
    mergeMap((pub) => pub.signedEvent),
    mergeMap((event) => {
      const relayAuth = pool.get(relay)
      if (relayAuth) {
        return auth(relayAuth, event)
      }
      return EMPTY
    }),
    filter((msg) => msg[0].toLowerCase() === RelayToClient.OK),
    take(1),
  )
}
