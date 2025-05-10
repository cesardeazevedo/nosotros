import { filter } from 'rxjs'
import type { MessageReceived } from '../types'
import { RelayToClient } from '../types'

export function ofNotice() {
  return filter((msg: MessageReceived) => msg[0].toUpperCase() === RelayToClient.NOTICE)
}
