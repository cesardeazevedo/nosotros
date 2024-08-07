export type NostrSettings = {
  nip05enabled: boolean
  nip05staleTime: number
  nip25enabled: boolean
  nip57enabled: boolean
  hintsEnabled: boolean
  outboxEnabled: boolean
  maxRelaysPerUser: number
}

export const defaultNostrSettings: NostrSettings = {
  nip05enabled: true,
  nip05staleTime: 60000 * 24,
  nip25enabled: true,
  nip57enabled: true,
  hintsEnabled: true,
  outboxEnabled: true,
  maxRelaysPerUser: 4,
}
