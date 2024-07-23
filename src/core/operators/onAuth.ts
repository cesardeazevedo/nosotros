import type { MessageReceived } from 'core/types'
import { RelayToClient } from 'core/types'
import { tap } from 'rxjs'

export function onAuth(callback: (challenge: string) => void) {
  return tap((event: MessageReceived) => {
    if (event[0].toLowerCase() === RelayToClient.AUTH) {
      callback(event[1])
    }
  })
}
