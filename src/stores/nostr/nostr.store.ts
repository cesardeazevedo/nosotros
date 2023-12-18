import { makeAutoObservable, runInAction } from 'mobx'
import { SubscriptionBatcher } from 'stores/core/batcher'
import { Filter } from 'stores/core/filter'
import { bufferTime } from 'stores/core/operators'
import { Pool } from 'stores/core/pool'
import { Subscription, SubscriptionOptions } from 'stores/core/subscription'
import { ObservableDB } from 'stores/db/observabledb.store'
import type { RootStore } from 'stores/root.store'
import { dedupe } from 'utils/utils'

export class NostrStore {
  pool: Pool
  batcher: SubscriptionBatcher
  events = new ObservableDB<{ id: string; relays: string[] }>('events-relays')

  static BUFFER_SUBSCRIPTION_GROUP_TIME = 800

  constructor(
    private root: RootStore,
    fixedRelays?: string[],
  ) {
    makeAutoObservable(this, {
      pool: false,
      batcher: false,
    })
    this.pool = new Pool(fixedRelays)
    this.batcher = new SubscriptionBatcher(root, NostrStore.BUFFER_SUBSCRIPTION_GROUP_TIME)

    this.batcher.send$.subscribe((subscription) => {
      subscription.start()
    })
  }

  initialize(relays: string[]) {
    this.pool.initialize(relays)
    this.batcher.resume()
  }

  getEventRelays(id: string) {
    return (this.events.get(id) || {})?.relays
  }

  async addEvent(id: string, relays: string[]) {
    const data = (await this.events.fetch(id))?.relays || []
    runInAction(() => {
      this.events.set(id, { id, relays: dedupe(data, relays) })
    })
  }

  subscribe(filter: Filter, options?: SubscriptionOptions) {
    const sub = new Subscription(this.root, filter, options)
    sub.event$.pipe(bufferTime(2000)).subscribe((events) => {
      const ids = dedupe(events.map((x) => x[1].id))
      ids.forEach((id) => {
        this.addEvent(id, sub.events.get(id) || [])
      })
    })
    this.batcher.send(sub)
    return sub
  }
}
