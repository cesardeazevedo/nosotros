export function formatRelayUrl(url: string | undefined = '') {
  return (url.endsWith('/') ? url.slice(0, -1) : url).toLowerCase().trim()
}

export function prettyRelayUrl(url: string | undefined) {
  return formatRelayUrl(url).replace('wss://', '')
}
