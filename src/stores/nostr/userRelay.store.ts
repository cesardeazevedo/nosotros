import type { RelaySelectionConfig } from '@/nostr/helpers/relaySelection'
import { selectRelays } from '@/nostr/helpers/relaySelection'
import type { UserRelayDB } from '@/nostr/nips/nip65.relaylist'
import { makeAutoObservable, observable } from 'mobx'

export class UserRelayStore {
  mailbox = observable.map<string, UserRelayDB[]>()
  // todo
  dm = observable.map<string, UserRelayDB[]>()
  search = observable.map<string, UserRelayDB[]>()

  constructor() {
    makeAutoObservable(this)
  }

  clear() {
    this.mailbox.clear()
    this.dm.clear()
    this.search.clear()
  }

  get(pubkey: string) {
    return this.mailbox.get(pubkey)
  }

  getRelays(pubkey: string) {
    return this.get(pubkey)?.map((x) => x.relay)
  }

  select(pubkey: string, config: RelaySelectionConfig) {
    return selectRelays(this.get(pubkey) || [], config)
  }

  add(pubkey: string, userRelays: UserRelayDB[]) {
    this.mailbox.set(pubkey, userRelays)
  }

  addDM() {}
}

export const userRelayStore = new UserRelayStore()
