import type { Kind } from '@/constants/kinds'
import type { MetadataDB } from '@/db/types'
import { decode } from 'light-bolt11-decoder'
import type { NostrEvent } from 'nostr-tools'
import { parseTags } from './parseTags'

const BOLT11_KEYS = ['coin_network', 'amount', 'separator', 'timestamp', 'expiry', 'payment_hash', 'description']

export interface ZapReceiptMetadata extends MetadataDB {
  kind: Kind.ZapReceipt
  zapper: string | undefined
  receiver: string | undefined
  receiverEvent: string | undefined
  bolt11: {
    amount?: {
      value: string
      letters: string
    }
    separator?: {
      letters: string
      value: string
    }
    timestamp?: {
      letters: string
      value: number
    }
    expiry?: {
      letters: string
      value: number
    }
    payment_hash?: {
      letters: string
      value: string
    }
  }
}

export function parseBolt11(decoded: ReturnType<typeof decode>) {
  return decoded.sections.reduce(
    (acc, x) => {
      if (BOLT11_KEYS.includes(x.name)) {
        acc[x.name as keyof ZapReceiptMetadata['bolt11']] = {
          letters: x.letters,
          value: x.value as never,
        }
      }
      return acc
    },
    {} as ZapReceiptMetadata['bolt11'],
  )
}

export function parseZapEvent(event: NostrEvent): ZapReceiptMetadata {
  const tags = parseTags(event.tags)
  const lnbc = tags.bolt11?.[0][1]
  const zapper = tags.P?.[0][1]
  const receiver = tags.p?.[0][1]
  const receiverEvent = tags.e?.[0][1]
  return {
    id: event.id,
    kind: event.kind,
    bolt11: lnbc ? parseBolt11(decode(lnbc)) : {},
    zapper,
    receiver,
    receiverEvent,
  }
}
