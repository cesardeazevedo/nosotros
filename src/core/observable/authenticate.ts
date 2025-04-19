import { Kind } from '@/constants/kinds'
import { NostrPublisher } from '@/core/NostrPublish'
import type { Signer } from '@/core/signers/signer'
import { ClientToRelay, RelayToClient } from '@/core/types'
import { filter, mergeMap, of, take, tap, throwError } from 'rxjs'
import type { Relay } from '../Relay'

type AuthOptions = {
  signer: Signer
  relay: Relay
  challenge: string
}

export function authenticate(options: AuthOptions) {
  const { relay, signer, challenge } = options
  const { url } = relay
  if (!signer) {
    const error = 'Not authenticated'
    return throwError(() => new Error(error))
  }

  const publish = new NostrPublisher(
    {
      kind: Kind.ClientAuth,
      content: '',
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['relay', url],
        ['challenge', challenge],
      ],
    },
    {
      signer,
      relays: of([url]),
    },
  )

  return of(publish).pipe(
    mergeMap((pub) => pub.signedEvent),
    tap((event) => relay.websocket$.next([ClientToRelay.AUTH, event] as never)),
    mergeMap(() => relay.websocket$),
    filter((msg) => msg[0].toUpperCase() === RelayToClient.OK),
    take(1),
  )
}
