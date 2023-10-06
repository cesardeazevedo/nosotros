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
    return (this.events.get(id) || {})?.relays?.slice().sort()
  }

  async addEvent(id: string, sub: Subscription) {
    const data = (await this.events.fetch(id))?.relays || []
    const relays = sub.events.get(id) || []
    if (dedupe(relays, data).sort() !== data.slice().sort()) {
      runInAction(() => {
        this.events.set(id, { id, relays: dedupe(relays, data || []) })
      })
    }
  }

  subscribe(filter: Filter, options?: SubscriptionOptions) {
    const sub = new Subscription(this.root, filter, options)
    sub.event$.pipe(bufferTime(2000)).subscribe((events) => {
      const ids = dedupe(events.map((x) => x[1].id))
      ids.forEach((id) => {
        this.addEvent(id, sub)
      })
    })
    this.batcher.send(sub)
    return sub
  }
}
