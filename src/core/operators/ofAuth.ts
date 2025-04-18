import type { MessageReceived } from 'core/types'
import { RelayToClient } from 'core/types'
import { distinct, filter, pipe, takeWhile } from 'rxjs'

export function ofAuth() {
  return pipe(
    // complete the stream if any event message was received, as the relay didn't required any auth
    takeWhile(([verb]: MessageReceived) => verb.toUpperCase() !== RelayToClient.EVENT),
    filter(([verb]) => verb.toUpperCase() === RelayToClient.AUTH),
    distinct((msg) => msg[1]),
  )
}
