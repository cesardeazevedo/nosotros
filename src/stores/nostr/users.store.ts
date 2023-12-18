import { Kind } from 'constants/kinds'
import { Duration } from 'luxon'
import { makeAutoObservable, observable } from 'mobx'
import { Event } from 'nostr-tools'
import { Subject, concatMap } from 'rxjs'
import { Filter } from 'stores/core/filter'
import { ofKind } from 'stores/core/operators'
import { SubscriptionOptions } from 'stores/core/subscription'
import { ObservableDB } from 'stores/db/observabledb.store'
import { User, UserMetaData } from 'stores/modules/user.store'
import { ParsedContent } from 'utils/contentParser'
import type { RootStore } from '../root.store'

type NIP05Response = {
  names?: Record<string, string>
  relays?: Record<string, string[]>
}

export type UserDB = UserMetaData & {
  id: string
  npub: `npub1${string}` | undefined
  createdAt: number
  aboutParsed: ParsedContent
}

export class UsersStore {
  users = new ObservableDB<UserDB, User>('users2', {
    indexes: ['name', 'displayName'],
    expireTime: Duration.fromObject({ hours: 12 }).toMillis(),
    serialize: (user) => user.serialize(),
    deserialize: (user) => User.deserialize(this.root, user),
  })

  wellknowns = new ObservableDB<NIP05Response & { id: string }>('wellknowns')

  nip05queue = new Subject<Event>()
  nip05blacklist = observable.set<string>([])

  constructor(private root: RootStore) {
    makeAutoObservable(this)
    this.nip05queue.pipe(concatMap((event) => this.fetchNIP05(event))).subscribe()
  }

  getUserById(id: string | undefined) {
    return this.users.get(id)
  }

  private async isNewer(event: Event) {
    const item = await this.users.fetch(event.pubkey)
    return event.created_at > (item?.metadata.createdAt || 0)
  }

  async add(event: Event) {
    if (event.content) {
      if (await this.isNewer(event)) {
        const user = User.fromNostrEvent(this.root, event)
        this.users.set(event.pubkey, user)
        return user
      }
    }
  }

  addNIP05Blacklist(url: string) {
    this.nip05blacklist.add(url)
  }

  async fetchNIP05Server(url: string) {
    const cached = await this.wellknowns.fetch(url)
    if (cached) {
      return cached
    }
    try {
      const res = await fetch(`https://${url}/.well-known/nostr.json`)
      const data = (await res.json()) as NIP05Response
      this.wellknowns.set(url, { id: url, ...data })
      return data
    } catch (error) {
      this.addNIP05Blacklist(url)
    }
  }

  async fetchNIP05(event: Event) {
    const user = JSON.parse(event.content || '{}') as UserMetaData
    if (user.nip05) {
      const [username, url] = user.nip05.toLowerCase().split('@')
      if (username && url && !this.nip05blacklist.has(url)) {
        const data = await this.fetchNIP05Server(url)
        if (data) {
          const pubkey = data.names?.[username] || ''
          const relays = data.relays?.[pubkey] || []
          this.root.userRelays.addFromNIP05(event.pubkey, relays)
        }
      }
    }
  }

  subscribe(authors: string[], options?: SubscriptionOptions) {
    const sub = this.root.nostr.subscribe(
      new Filter(this.root, {
        kinds: [Kind.Metadata, Kind.RelayList],
        authors,
      }),
      options,
    )
    // Handle Metadata user events
    sub.onEvent$.pipe(ofKind(Kind.Metadata)).subscribe((event) => {
      this.add(event)
      this.nip05queue.next(event)
    })
    // Handle RelayList events
    sub.onEvent$.pipe(ofKind(Kind.RelayList)).subscribe((event) => this.root.userRelays.add(event))
    return sub
  }
}
