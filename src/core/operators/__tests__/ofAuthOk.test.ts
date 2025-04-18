import type { MessageReceived } from '@/core/types'
import { RelayToClient } from '@/core/types'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import type { Observable } from 'rxjs'
import { from } from 'rxjs'
import { ofAuthOk } from '../ofAuthOk'

describe('ofAuthOk', () => {
  test('assert relay requested auth', async () => {
    const msg$ = from([
      [RelayToClient.AUTH, 'auth'],
      [RelayToClient.CLOSED, '1'],
      [RelayToClient.CLOSED, '2'],
      [RelayToClient.CLOSED, '3'],
      [RelayToClient.OK, '123'],
    ]) as Observable<MessageReceived>
    const $ = msg$.pipe(ofAuthOk())
    const spy = subscribeSpyTo($)
    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([[RelayToClient.OK, '123']])
  })
})
