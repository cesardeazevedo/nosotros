import type { RelaySelectionConfig } from '@/nostr/helpers/selectRelays'
import { selectRelays } from '@/nostr/helpers/selectRelays'
import type { UserRelay, UserRelayListMetadata } from '@/nostr/types'
import type { ObservableSet } from 'mobx'
import { makeAutoObservable, observable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'

export class UserRelayStore {
  mailbox = observable.map<string, UserRelay[]>()
  // todo
  dm = observable.map<string, UserRelay[]>()
  search = observable.map<string, UserRelay[]>()

  pubkeysByRelay = observable.map<string, ObservableSet>()

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

  getPubkeysFromRelay(relay: string) {
    return [...(this.pubkeysByRelay.get(relay) || [])]
  }

  select(pubkey: string, config: RelaySelectionConfig) {
    return selectRelays(this.get(pubkey) || [], config)
  }

  add(event: NostrEvent, metadata: UserRelayListMetadata) {
    this.mailbox.set(event.pubkey, metadata.relayList)
    metadata.relayList.forEach((userRelay) => {
      this.addPubkeyToRelay(userRelay.relay, userRelay.pubkey)
    })
  }

  addPubkeyToRelay(relay: string, pubkey: string) {
    const found = this.pubkeysByRelay.get(relay)
    if (found) {
      found.add(pubkey)
      return
    }
    this.pubkeysByRelay.set(relay, observable.set([pubkey]))
  }

  addDM() {}
}

export const userRelayStore = new UserRelayStore()
