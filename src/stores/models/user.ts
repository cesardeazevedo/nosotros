import type { UserDB } from 'nostr/types'
import { makeAutoObservable } from 'mobx'
import { nip19 } from 'nostr-tools'
import { followsStore } from 'stores/nostr/follows.store'
import { encodeSafe } from 'utils/nip19'

class User {
  constructor(public data: UserDB) {
    makeAutoObservable(this, { data: false })
  }

  get meta() {
    return this.data.metadata
  }

  get displayName() {
    return this.meta?.displayName || this.meta?.display_name || this.meta?.name || this.data.id?.slice(0, 10)
  }

  get initials() {
    return this.displayName[0]
  }

  get nprofile() {
    if (this.data.pubkey) {
      return encodeSafe(() => {
        return nip19.nprofileEncode({ pubkey: this.data.pubkey, relays: [] })
      })
    }
  }

  get following() {
    return followsStore.get(this.data.pubkey)
  }
}

export default User
