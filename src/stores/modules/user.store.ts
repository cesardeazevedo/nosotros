import { reaction } from 'mobx'
import { Event as NostrEvent, nip19 } from 'nostr-tools'
import { UserDB } from 'stores/nostr/users.store'
import type { RootStore } from 'stores/root.store'
import { ContentParser } from 'utils/contentParser'
import { encodeSafe } from 'utils/nip19'

export type UserMetaData = {
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

export class User {
  metadata: UserDB
  nprofile: string | undefined

  constructor(
    private root: RootStore,
    metadata: UserDB,
  ) {
    this.metadata = metadata

    reaction(
      () => this.root.userRelays.getRelaysFromAuthor(this.id),
      (arg) => {
        this.nprofile = encodeSafe(() => nip19.nprofileEncode({ pubkey: this.metadata.id, relays: arg }))
      },
      { fireImmediately: true },
    )
  }

  static deserialize(root: RootStore, data: UserDB) {
    return new User(root, data)
  }

  static fromNostrEvent(root: RootStore, event: NostrEvent) {
    const metadata = JSON.parse(event.content) as UserMetaData
    const content = new ContentParser(event)
    const data: UserDB = {
      ...metadata,
      id: event.pubkey,
      npub: encodeSafe(() => nip19.npubEncode(event.pubkey)),
      createdAt: event.created_at,
      aboutParsed: content.parse(),
    }
    return new User(root, data)
  }

  serialize(): UserDB {
    return this.metadata
  }

  get id() {
    return this.metadata.id
  }

  get relays() {
    return this.root.userRelays.fetchRelaysFromAuthor(this.metadata.id)
  }

  get displayName() {
    const { metadata } = this
    return metadata.displayName || metadata.display_name || metadata.name || metadata.id.slice(0, 10)
  }

  get picture() {
    return this.metadata.picture
  }

  get initial() {
    return this.displayName[0]
  }
}
