import type { MessageReceived } from '@/core/types'
import { RelayToClient } from '@/core/types'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import type { Observable } from 'rxjs'
import { from } from 'rxjs'
import { ofAuth } from '../ofAuth'

describe('ofAuth', () => {
  test('assert auth messages', async () => {
    const msg$ = from([
      [RelayToClient.AUTH, '123'],
      [RelayToClient.CLOSED, '1'],
      [RelayToClient.CLOSED, '2'],
      [RelayToClient.CLOSED, '3'],
    ]) as Observable<MessageReceived>
    const $ = msg$.pipe(ofAuth())
    const spy = subscribeSpyTo($)
    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([[RelayToClient.AUTH, '123']])
  })
})
