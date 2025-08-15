import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { atom } from 'jotai'
import { store } from './store'

type RelayStatus = {
  url: string
  auth: string | false
  connected: boolean
}

export const relaysAtom = atom<Record<string, RelayStatus>>({})

export const connectedRelaysAtom = atom((get) => {
  const map = get(relaysAtom)
  return Object.entries(map)
    .filter(([, s]) => s.connected)
    .map(([url]) => url)
})

export const authRelaysAtom = atom((get) => {
  const map = get(relaysAtom)
  return Object.entries(map).filter(([, s]) => s.auth)
})

function upsert(url: string, patch: Partial<RelayStatus>) {
  const key = formatRelayUrl(url)
  store.set(relaysAtom, (prev) => {
    const current = prev[key] || { connected: false, auth: false }
    return { ...prev, [key]: { ...current, ...patch } }
  })
}

export function addRelay(_url: string) {
  const url = formatRelayUrl(_url)
  store.set(relaysAtom, (prev) => {
    if (prev[url]) {
      return prev
    }
    return { ...prev, [url]: { url, connected: false, auth: false } }
  })
}

export function setRelayConnected(url: string, value: boolean) {
  upsert(url, { connected: value })
}

export function setRelayAuth(url: string, challenge: string | false) {
  console.log('AUTH', url, challenge)
  upsert(url, { auth: challenge })
}
