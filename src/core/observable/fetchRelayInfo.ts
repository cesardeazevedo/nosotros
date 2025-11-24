import type { RelayInformation } from 'nostr-tools/nip11'

export async function fetchRelayInfo(url: string) {
  try {
    const res = await fetch(url.replace('wss://', 'https://'), {
      method: 'GET',
      credentials: 'omit',
      priority: 'low',
      headers: {
        Accept: 'application/nostr+json',
      },
    })
    return (await res.json()) as RelayInformation
  } catch {
    return null
  }
}
