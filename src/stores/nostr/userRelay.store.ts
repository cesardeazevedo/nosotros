import { makeAutoObservable } from 'mobx'
import { Event } from 'nostr-tools'
import { ObservableDB } from 'stores/db/observabledb.store'
import { dedupe } from 'utils/utils'
import type { RootStore } from '../root.store'

export type Relay = {
  read: boolean
  write: boolean
}

export type SchemaNIP65 = {
  pubkey: string
  timestamp: number
  relays: Record<string, Relay>
}

export type SchemaNIP05 = {
  pubkey: string
  relays: string[]
}

export class UserRelayStore {
  relays = new ObservableDB<SchemaNIP65>('user-relays', { keyPath: 'pubkey' })
  relaysNIP05 = new ObservableDB<SchemaNIP05>('user-relays-nip05', { keyPath: 'pubkey' })

  constructor(private root: RootStore) {
    makeAutoObservable(this)
  }

  /**
   * User relay selection goes here, we want to do something a lot more sophisticated than this.
   *
   * @param author
   * @param write
   * @returns
   */
  async fetchRelaysFromAuthor(author: string, write?: boolean) {
    const relaysNIP65 = await this.relays.fetch(author)
    const relaysNIP05 = await this.relaysNIP05.fetch(author)
    return dedupe(this.selectNIP65Relays(relaysNIP65, write), relaysNIP05?.relays)
  }

  getRelaysFromAuthor = (author: string, write?: boolean) => {
    const relaysNIP65 = this.relays.get(author)
    const relaysNIP05 = this.relaysNIP05.get(author)
    return dedupe(this.selectNIP65Relays(relaysNIP65, write), relaysNIP05?.relays)
  }

  private selectNIP65Relays(relays: SchemaNIP65 | undefined, write?: boolean) {
    return Object.entries(relays?.relays || {})
      .filter(([, relay]) => (write !== undefined ? relay.write === write : true))
      .map((x) => x[0])
      .filter((x) => !this.root.nostr.pool.blacklist.has(x))
      .slice(0, this.root.settings.maxRelaysPerUser) as string[]
  }

  private async isNewer(event: Event) {
    const item = await this.relays.fetch(event.pubkey)
    return event.created_at > (item?.timestamp || 0)
  }

  async add(event: Event) {
    if (await this.isNewer(event)) {
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
    if (pubkey && relays.length > 0) {
      this.relaysNIP05.set(pubkey, { pubkey, relays })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addFromContacts(_event: Event) {
    // TODO
  }
}
