export type NostrSettings = typeof defaultNostrSettings

export const defaultNostrSettings = {
  nip05enabled: true,
  nip05staleTime: 60000 * 24,
  nip18enabled: true,
  nip25enabled: true,
  nip57enabled: true,
  offline: false,
  localDB: true,
  localRelays: [] as string[],
  hintsEnabled: true,
  outboxEnabled: true,
  maxRelaysPerUserInbox: 4,
  maxRelaysPerUserOutbox: 4,
  clientTag: true,
}
