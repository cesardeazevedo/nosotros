import type { MessageReceived } from 'core/types'
import { RelayToClient } from 'core/types'
import { distinct, filter, pipe } from 'rxjs'

export function ofAuth() {
  return pipe(
    filter(([verb]: MessageReceived) => verb.toUpperCase() === RelayToClient.AUTH),
    distinct((msg) => msg[1]),
  )
}
