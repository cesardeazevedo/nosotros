export const OUTBOX_RELAYS = JSON.parse(import.meta.env.VITE_OUTBOX_RELAYS) as string[]
export const DEFAULT_RELAYS = JSON.parse(import.meta.env.VITE_DEFAULT_RELAYS) as string[]
export const DEFAULT_NOSTR_CONNECT_RELAY = import.meta.env.VITE_DEFAULT_NOSTR_CONNECT_RELAY as string
