import { makeAutoObservable, runInAction } from 'mobx'
import { Event } from 'nostr-tools'
import { ObservableDB } from 'stores/db/observabledb.store'
import { ParsedContent, parseUserAbout } from 'utils/contentParser'
import type { RootStore } from '../root.store'

type NIP05Response = {
  names?: Record<string, string>
  relays?: Record<string, string[]>
}

export type UserState = {
  id: string
  npub?: string
  name?: string
  display_name?: string
  displayName?: string
  about?: string
  picture?: string
  website?: string
  banner?: string
  reactions?: boolean
  followingCount?: number
  followersCount?: number
  nip05?: string
  nip05valid?: boolean
  lud06?: string
  lud16?: string
}

export type ParsedState = {
  id: string
  content: ParsedContent
}

export class UserStore {
  ids = new Set<string>()
  users = new ObservableDB<UserState>('users', { indexes: ['name', 'displayName'] })
  contentParsed = new ObservableDB<ParsedState>('users-content-parsed')

  result: unknown[] = []

  constructor(private root: RootStore) {
    makeAutoObservable(this)
    this.updateIds()
  }

  add(event: Event) {
    if (event.content) {
      const data: UserState = JSON.parse(event.content)
      data.id = event.pubkey
      data.npub = this.root.auth.encode(event.pubkey)
      this.users.set(event.pubkey, data)
      this.contentParsed.set(event.pubkey, { id: data.id, content: parseUserAbout(data.about || '') })
      this.ids.add(data.id)
      this.fetchNIP05(data)
    }
  }

  updateIds() {
    this.users.keys().then((keys) => {
      runInAction(() => {
        this.ids = keys as Set<string>
      })
    })
  }

  async fetch(id: string) {
    return await this.users.fetch(id)
  }

  async fetchNIP05(user: UserState) {
    try {
      if (user.nip05) {
        const [username, url] = user.nip05.split('@')
        if (username && url) {
          const res = await fetch(`https://${url}/.well-known/nostr.json`)
          const data = (await res.json()) as NIP05Response
          const pubkey = data.names?.[username] || ''
          const relays = data.relays?.[pubkey]
          if (pubkey && relays) {
            this.root.userRelays.addFromNIP05(user.id, relays)
          }
        }
      }
      // eslint-disable-next-line no-empty
    } catch (error) {}
  }

  getUserById(id: string | undefined) {
    return this.users.get(id || '')
  }

  getContentById(id: string | undefined) {
    return this.contentParsed.get(id || '')?.content || []
  }
}
