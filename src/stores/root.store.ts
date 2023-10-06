import { DEFAULT_RELAYS, RECOMMENDED_PUBKEYS } from 'constants/recommended'
import { AuthStore } from './auth/auth.store'
import { database } from './db/database.store'
import { FeedStore } from './modules/feed.store'
import { ContactStore } from './nostr/contact.store'
import { NostrStore } from './nostr/nostr.store'
import { NoteStore } from './nostr/note.store'
import { ReactionStore } from './nostr/reaction.store'
import { SubscriptionsStore } from './nostr/subscriptions.store'
import { UserStore } from './nostr/user.store'
import { UserRelayStore } from './nostr/userRelay.store'
import { DeckStore } from './ui/deck.store'
import { DialogStore } from './ui/dialogs.store'
import { SettingStore } from './ui/setting.store'

export class RootStore {
  // nostr
  nostr = new NostrStore(this)
  auth = new AuthStore(this)
  notes = new NoteStore(this)
  users = new UserStore(this)
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
    const relays = this.auth.pubkey ? await this.userRelays.getRelaysFromAuthor(this.auth.pubkey || '') : fixedRelays
    this.nostr.initialize(relays.length > 0 ? relays : fixedRelays)
  }

  initializeHome() {
    const { pubkey } = this.auth
    const pubkeys = pubkey ? [pubkey] : RECOMMENDED_PUBKEYS
    const feed = new FeedStore(this, { authors: pubkeys, contacts: !!pubkey })
    this.deck.reset()
    this.deck.add(DeckStore.MAIN_FEED, feed)
    this.initialize()
  }

  initializeProfileRoute(author: string) {
    const feed = new FeedStore(this, { authors: [author], contacts: false, range: 24 * 60 })
    this.initialize()
    this.deck.add(author, feed)
    return feed
  }
}
