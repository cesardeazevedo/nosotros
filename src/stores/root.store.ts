import { RECOMMENDED_PUBKEYS } from 'constants/recommended'
import { DEFAULT_RELAYS } from 'constants/relays'
import { AuthStore } from './auth/auth.store'
import { RelayHintsData } from './core/relayHints'
import { database } from './db/database.store'
import { FeedStore } from './modules/feed.store'
import { ContactStore } from './nostr/contacts.store'
import { NostrStore } from './nostr/nostr.store'
import { NotesStore } from './nostr/notes.store'
import { ReactionStore } from './nostr/reactions.store'
import { SubscriptionsStore } from './nostr/subscriptions.store'
import { UserRelayStore } from './nostr/userRelay.store'
import { UsersStore } from './nostr/users.store'
import { DeckStore } from './ui/deck.store'
import { DialogStore } from './ui/dialogs.store'
import { SettingStore } from './ui/setting.store'

export class RootStore {
  // nostr
  nostr = new NostrStore(this)
  auth = new AuthStore(this)
  notes = new NotesStore(this)
  users = new UsersStore(this)
  userRelays = new UserRelayStore(this)
  reactions = new ReactionStore(this)
  contacts = new ContactStore(this)
  subscriptions = new SubscriptionsStore(this)

  // UI
  deck = new DeckStore()
  dialogs = new DialogStore()
  settings = new SettingStore()

  constructor() {
    database.initialize()
  }

  async initialize(fixedRelays = DEFAULT_RELAYS) {
    const relays = this.auth.pubkey ? await this.userRelays.fetchRelaysFromAuthor(this.auth.pubkey || '') : fixedRelays
    this.nostr.initialize(relays.length > 0 ? relays : fixedRelays)
  }

  initializeFeed() {
    const { pubkey } = this.auth
    const pubkeys = pubkey ? [pubkey] : RECOMMENDED_PUBKEYS
    const feed = new FeedStore(this, { name: DeckStore.MAIN_FEED, authors: pubkeys, contacts: !!pubkey })
    this.users.subscribe(pubkeys)
    this.deck.add(DeckStore.MAIN_FEED, feed)
    this.initialize()
  }

  initializeProfileRoute(author: string, relays?: string[]) {
    const feed = new FeedStore(this, {
      name: author,
      authors: [author],
      contacts: false,
      pagination: true,
      range: 60 * 24 * 5,
    })
    this.initialize()
    this.users.subscribe([author], { relayHints: { authors: { [author]: relays || [] } } })
    this.deck.add(author, feed)
    return feed
  }

  async initializePostRoute(id: string, author?: string, relays?: string[]) {
    this.initialize()
    const note = await this.notes.notes.fetch(id)
    if (!note) {
      const relayHints: RelayHintsData = { ids: { [id]: relays || [] }, fallback: { [id]: author ? [author] : [] } }
      this.notes.subNotesByIds([id], { relayHints })
    }
    return note
  }
}
