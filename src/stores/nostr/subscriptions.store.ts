import { Kind } from 'constants/kinds'
import { share } from 'rxjs'
import { Filter } from 'stores/core/filter'
import { bufferTime } from 'stores/core/operators'
import { Subscription, SubscriptionOptions } from 'stores/core/subscription'
import type { RootStore } from 'stores/root.store'

export class SubscriptionsStore {
  constructor(private root: RootStore) {}

  subscribe(filter: Filter, options?: SubscriptionOptions): Subscription {
    return this.root.nostr.subscribe(filter, options)
  }

  subContacts(author: string) {
    const sub = this.subscribe(
      new Filter(this.root, {
        kinds: [Kind.Contacts],
        authors: [author],
      }),
    )
    const contacts$ = sub.onEvent$.pipe(share())

    contacts$.subscribe((event) => {
      this.root.contacts.add(event)
      if (event.content) {
        this.root.userRelays.addFromContacts(event)
      }
    })
    return contacts$
  }

  subReactions(noteIds: string[]) {
    const sub = this.subscribe(
      new Filter(this.root, {
        kinds: [Kind.Reaction],
        '#e': noteIds,
      }),
    )
    sub.onEvent$.pipe(bufferTime(2000)).subscribe((events) => {
      events.forEach((event) => {
        this.root.reactions.add(event)
      })
    })
    return sub
  }
}
