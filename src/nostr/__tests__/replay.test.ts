import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { of, tap } from 'rxjs'
import { vi } from 'vitest'
import { ShareReplayCache } from '../replay'

describe('ShareReplayCache', () => {
  test('assert replay wrap', async () => {
    const replay = new ShareReplayCache()
    const stub = vi.fn()
    const subscribe = replay.wrap((pubkey: string) => of(pubkey).pipe(tap((x) => stub(x))))
    const spy = subscribeSpyTo(subscribe('1'))
    const spy2 = subscribeSpyTo(subscribe('1'))
    await spy.onComplete()
    await spy2.onComplete()
    expect(stub).toHaveBeenCalledTimes(1)
    expect(spy.getValues()).toStrictEqual(['1'])
    expect(spy2.getValues()).toStrictEqual(['1'])
  })
})
