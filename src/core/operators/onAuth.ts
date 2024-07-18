import type { MessageReceived } from 'core/types'
import { MessageReceivedTypes } from 'core/types'
import { tap } from 'rxjs'

export function onAuth(callback: (challenge: string) => void) {
  return tap((event: MessageReceived) => {
    if (event[0].toLowerCase() === MessageReceivedTypes.AUTH) {
      callback(event[1])
    }
  })
}
