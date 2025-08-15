export const OUTBOX_RELAYS = JSON.parse(import.meta.env.VITE_OUTBOX_RELAYS) as string[]
export const SEARCH_RELAYS = JSON.parse(import.meta.env.VITE_SEARCH_RELAYS) as string[]
export const FALLBACK_RELAYS = JSON.parse(import.meta.env.VITE_FALLBACK_RELAYS) as string[]
export const DEFUNCT_RELAYS = JSON.parse(import.meta.env.VITE_DEFUNCT_RELAYS) as string[]
export const RELAY_SELECTION_IGNORE = JSON.parse(import.meta.env.VITE_RELAY_SELECTION_IGNORE) as string[]

export const DEFAULT_NOSTR_CONNECT_RELAY = import.meta.env.VITE_DEFAULT_NOSTR_CONNECT_RELAY as string
export const DEFAULT_RELAY_MONITOR_PUBKEY = import.meta.env.VITE_DEFAULT_RELAY_MONITOR as string
