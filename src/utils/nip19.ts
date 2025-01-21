import { nip19 } from 'nostr-tools'

export function decodeNIP19(...data: Parameters<typeof nip19.decode>) {
  if (data) {
    try {
      return nip19.decode(...data)
    } catch {
      return undefined
    }
  }
}

export function encodeSafe<T>(callback: () => T) {
  try {
    return callback()
  } catch {
    return undefined
  }
}
