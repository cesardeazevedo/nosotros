import { makeAutoObservable } from 'mobx'
import { Event } from 'nostr-tools'
import { ObservableDB } from 'stores/db/observabledb.store'
import type { RootStore } from '../root.store'

export class ContactStore {
  contacts = new ObservableDB<{ id: string; timestamp: number; tags: Event['tags'] }>('contacts')

  constructor(private root: RootStore) {
    makeAutoObservable(this)
  }

  async add(event: Event) {
    if (await this.isNewer(event)) {
      return this.contacts.set(event.pubkey, { id: event.pubkey, timestamp: event.created_at, tags: event.tags })
    }
  }

  async isNewer(event: Event) {
    return event.created_at > ((await this.fetchByAuthor(event.pubkey))?.timestamp || 0)
  }

  async fetchByAuthor(author: string) {
    return (await this.contacts.fetch(author)) || { timestamp: 0, tags: [] }
  }

  getByAuthor(author: string) {
    return this.contacts.get(author) || { timestamp: 0, tags: [] }
  }
}
