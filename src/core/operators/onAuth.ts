import type { MessageReceived } from 'core/types'
import { RelayToClient } from 'core/types'
import { distinct, filter, pipe } from 'rxjs'

export function onAuth() {
  return pipe(
    filter((msg: MessageReceived) => msg[0].toLowerCase() === RelayToClient.AUTH),
    distinct((msg) => msg[1]),
  )
}
