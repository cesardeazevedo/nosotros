import type { MessageReceived } from 'core/types'
import { RelayToClient } from 'core/types'
import { filter } from 'rxjs'

export function ofOk() {
  return filter((msg: MessageReceived) => msg[0].toUpperCase() === RelayToClient.OK)
}
