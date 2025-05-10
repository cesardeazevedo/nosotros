import type { MessageReceived } from '@/core/types'
import { RelayToClient } from '@/core/types'
import { fakeEvent } from '@/utils/faker'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import type { Observable } from 'rxjs'
import { from, Subject } from 'rxjs'
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

  test('assert no auth messages and complete the stream', async () => {
    const subject = new Subject<MessageReceived>()
    const $ = subject.asObservable().pipe(ofAuth())
    const spy = subscribeSpyTo($)
    subject.next([RelayToClient.EVENT, '1', fakeEvent({ kind: 1 })])
    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([])
  })
})
