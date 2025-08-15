import type { RelayInformation } from 'nostr-tools/nip11'

// Adapted from coracle https://github.com/coracle-social/welshman/blob/c6434028a6dd24b091184cac23f39d681ac01ca3/packages/app/src/sync.ts#L10
export const hasNegentropy = (info: RelayInformation | undefined) => {
  if (info?.supported_nips?.includes?.(77)) {
    return true
  }
  if (info?.software?.includes?.('strfry') && !info?.version?.match(/^0\./)) {
    return true
  }

  return false
}
