import { decode } from 'light-bolt11-decoder'
import type { NostrEvent } from 'nostr-tools'
import type { ZapMetadataDB } from '../types'
import { parseTags } from './parseTags'

const BOLT11_KEYS = ['coin_network', 'amount', 'separator', 'timestamp', 'expiry', 'payment_hash', 'description']

export function parseBolt11(decoded: ReturnType<typeof decode>) {
  return decoded.sections.reduce(
    (acc, x) => {
      if (BOLT11_KEYS.includes(x.name)) {
        acc[x.name as keyof ZapMetadataDB['bolt11']] = {
          letters: x.letters,
          value: x.value as never,
        }
      }
      return acc
    },
    {} as ZapMetadataDB['bolt11'],
  )
}

export function parseZapEvent(event: NostrEvent): ZapMetadataDB {
  const { bolt11, ...tags } = parseTags(event.tags)
  const lnbc = bolt11?.[0][1]
  if (lnbc) {
    const decoded = decode(lnbc)
    return {
      id: event.id,
      kind: event.kind,
      bolt11: parseBolt11(decoded),
      tags,
    }
  }
  return {
    id: event.id,
    kind: event.kind,
    bolt11: {},
    tags,
  }
}
