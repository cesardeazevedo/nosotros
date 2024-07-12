import type { UserRelayDB } from "db/types"
import { storage } from "nostr/storage"
import { Subject } from "rxjs"

const userRelayUpdates = new Subject<[string, UserRelayDB[]]>()
export const userRelayUpdates$ = userRelayUpdates.asObservable()

export async function insertUserRelay(pubkey: string, userRelays: UserRelayDB[]) {
  await storage.insertUserRelayBulk(userRelays)
  userRelayUpdates.next([pubkey, userRelays])
}
