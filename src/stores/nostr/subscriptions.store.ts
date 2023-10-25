import { Kind } from 'constants/kinds'
import { share } from 'rxjs'
import { Filter } from 'stores/core/filter'
import { bufferLatestCreatedAt, bufferTime, ofKind } from 'stores/core/operators'
import { Subscription, SubscriptionOptions } from 'stores/core/subscription'
import { PostStore } from 'stores/modules/post.store'
import type { RootStore } from 'stores/root.store'
import { dedupe } from 'utils/utils'

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

  subUsers(authors: string[]) {
    const sub = this.subscribe(
      new Filter(this.root, {
        kinds: [Kind.Metadata, Kind.RelayList],
        authors,
      }),
    )
    // Handle Metadata user events
    sub.onEvent$
      .pipe(ofKind(Kind.Metadata), bufferLatestCreatedAt())
      .subscribe((events) => events.forEach((event) => this.root.users.add(event)))
    // Handle RelayList events
    sub.onEvent$
      .pipe(ofKind(Kind.RelayList), bufferLatestCreatedAt())
      .subscribe((events) => events.forEach((event) => this.root.userRelays.add(event)))
    return sub
  }

  subUsersRelays(authors: string[]) {
    return this.subscribe(
      new Filter(this.root, {
        kinds: [Kind.RelayList],
        authors,
      }),
    )
  }

  subNotes(filter: Filter, options?: SubscriptionOptions) {
    const sub = this.subscribe(filter, options)
    // Get users from posts
    sub.posts$.subscribe((posts) => {
      const authors = posts.map((x) => x.event.pubkey)
      const authorsTagged = PostStore.mergeTags(posts.map((x) => x.authorsTags))
      const authorsEncoded = posts.map((x) => x.noteContent?.map((x) => x.author || []) || []).flat() as string[]
      this.root.subscriptions.subUsers(dedupe(authors, authorsTagged, authorsEncoded))
    })
    return sub
  }
}
