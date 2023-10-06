import { makeAutoObservable } from 'mobx'
import { Event } from 'nostr-tools'
import { ObservableDB } from 'stores/db/observabledb.store'
import { dedupe } from 'utils/utils'
import type { RootStore } from '../root.store'

export type Relay = {
  read: boolean
  write: boolean
}

export type RelayStore = {
  timestamp: number
  relays: Record<string, Relay>
}

type SchemaNIP65 = {
  pubkey: string
  timestamp: number
  relays: Record<string, Relay>
}

type SchemaNIP05 = {
  pubkey: string
  relays: string[]
}

export class UserRelayStore {
  relays = new ObservableDB<SchemaNIP65>('user-relays', { keyPath: 'pubkey' })
  relaysNIP05 = new ObservableDB<SchemaNIP05>('user-relays-nip05', { keyPath: 'pubkey' })

  constructor(private root: RootStore) {
    makeAutoObservable(this)
  }

  private async getRelaysFromNIP65(author: string, write?: boolean) {
    const data = await this.relays.fetch(author)
    return Object.entries(data?.relays || {})
      .filter(([, relay]) => (write !== undefined ? relay.write === write : true))
      .map((x) => x[0])
      .slice(0, this.root.settings.maxRelaysPerUser) as string[] // This is just a safety limit for now, we want to make this configurable
  }

  private async getRelaysFromNIP05(author: string) {
    const data = await this.relaysNIP05.fetch(author)
    return data?.relays || []
  }

  /**
   * User relay selection goes here, we want to do something a lot more sophisticated than this.
   *
   * @param author
   * @param write
   * @returns
   */
  async getRelaysFromAuthor(author: string, write?: boolean) {
    const relaysNIP65 = await this.getRelaysFromNIP65(author, write)
    const relaysNIP05 = await this.getRelaysFromNIP05(author)
    return dedupe(relaysNIP65, relaysNIP05)
  }

  async add(event: Event) {
    if (this.isNewer(event)) {
      const relays = event.tags.reduce(
        (acc, tag) => {
          if (tag[0] === 'r') {
            const url = tag[1].split('\n')[0] // some bad format urls
            return {
              ...acc,
              [url.trim().replace(/\/$/, '')]: {
                read: tag[2] === 'write' ? false : true,
                write: tag[2] === 'read' ? false : true,
              },
            }
          }
          return acc
        },
        {} as Record<string, Relay>,
      )

      return this.relays.set(event.pubkey, { pubkey: event.pubkey, timestamp: event.created_at, relays })
    }
  }

  async addFromNIP05(pubkey: string, relays: string[]) {
    this.relaysNIP05.set(pubkey, { pubkey, relays })
  }

  addFromContacts() {
    // TODO
  }

  isNewer(event: Event) {
    return event.created_at > (this.relays.get(event.pubkey)?.timestamp || 0)
  }
}
