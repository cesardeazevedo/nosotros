import { decode } from 'light-bolt11-decoder'
import type { NostrEvent } from 'nostr-tools'
import type { Metadata } from '../../nostr/types'

const BOLT11_KEYS = ['coin_network', 'amount', 'separator', 'timestamp', 'expiry', 'payment_hash', 'description']

export type Bolt11 = {
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

export function parseBolt11(lnbc: string) {
  try {
    const decoded = decode(lnbc)
    return decoded.sections.reduce((acc, x) => {
      if (BOLT11_KEYS.includes(x.name)) {
        acc[x.name as keyof Bolt11] = {
          letters: x.letters,
          value: x.value as never,
        }
      }
      return acc
    }, {} as Bolt11)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {}
  }
}

export function parseZapEvent(event: NostrEvent): Metadata {
  const lnbc = event.tags.find((tag) => tag[0] === 'bolt11')?.[1]
  return {
    bolt11: lnbc ? parseBolt11(lnbc) : {},
  }
}
