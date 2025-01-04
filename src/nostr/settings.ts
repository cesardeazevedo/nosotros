export type NostrSettings = typeof defaultNostrSettings

export const defaultNostrSettings = {
  nip05: true,
  hints: true,
  outbox: true,
  offline: false,
  localDB: true,
  localRelays: [] as string[],
  maxRelaysPerUserInbox: 4,
  maxRelaysPerUserOutbox: 4,
  clientTag: true,
}
