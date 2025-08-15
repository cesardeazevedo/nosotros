import type { RelayInformation } from 'nostr-tools/nip11'

export async function fetchRelayInfo(url: string) {
  const res = await fetch('https://' + url.replace('wss://', ''), {
    method: 'GET',
    credentials: 'omit',
    priority: 'low',
    headers: {
      Accept: 'application/nostr+json',
    },
  })
  return (await res.json()) as RelayInformation
}
