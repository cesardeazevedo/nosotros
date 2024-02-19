import { makeAutoObservable } from 'mobx'
import type { Event } from 'nostr-tools'
import { ObservableDB } from 'stores/db/observabledb.store'
import type { RootStore } from '../root.store'

type ContactsDB = {
  id: string
  timestamp: number
  contacts: Record<string, boolean>
  tags?: Event['tags']
}

export class ContactStore {
  contacts = new ObservableDB<ContactsDB>('contacts')

  constructor(private root: RootStore) {
    makeAutoObservable(this)
  }

  async add(event: Event) {
    if (await this.isNewer(event)) {
      const contacts = event.tags.reduce((acc, tag) => ({ ...acc, [tag[1]]: true }), {})
      return this.contacts.set(event.pubkey, {
        id: event.pubkey,
        timestamp: event.created_at,
        contacts,
      })
    }
  }

  async isNewer(event: Event) {
    return event.created_at > ((await this.fetchByAuthor(event.pubkey))?.timestamp || 0)
  }

  async fetchByAuthor(author: string) {
    return await this.contacts.fetch(author)
  }

  getByAuthor(author: string) {
    return this.contacts.get(author)
  }

  isFollowing(author: string | undefined) {
    const me = this.root.auth.pubkey
    return (author && this.contacts.get(me)?.contacts[author]) || false
  }
}
