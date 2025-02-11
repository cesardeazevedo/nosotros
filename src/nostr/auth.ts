import { Kind } from '@/constants/kinds'
import { NostrPublisher } from '@/core/NostrPublish'
import { auth } from '@/core/operators/auth'
import { RelayToClient } from '@/core/types'
import { EMPTY, filter, mergeMap, of, take, throwError } from 'rxjs'
import type { NostrContext } from './context'
import { pool } from './pool'

export function authenticate(ctx: NostrContext, relay: string, challenge: string) {
  const { signer, pubkey } = ctx
  if (!pubkey || !signer) {
    const error = 'Not authenticated'
    return throwError(() => new Error(error))
  }

  const publish = new NostrPublisher(
    {
      kind: Kind.ClientAuth,
      content: '',
      pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['relay', relay],
        ['challenge', challenge],
      ],
    },
    {
      signer,
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
