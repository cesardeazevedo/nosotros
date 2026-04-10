import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { parseEventMetadata } from '@/hooks/parsers/parseEventMetadata'
import { Kind } from 'constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import { finalizeEvent, generateSecretKey } from 'nostr-tools'

export function fakeEvent(data?: Partial<NostrEvent>): NostrEvent {
  const kind = data?.kind ?? Kind.Text
  return {
    kind,
    id: data?.id || Math.random().toString().slice(2),
    content: data?.content ?? 'Hello World',
    created_at: data?.created_at ?? Math.floor(Date.now() / 1000 - 1000),
    pubkey: data?.pubkey || '1',
    tags: data?.tags || [],
    sig: '',
  }
}

export function fakeEventMeta(data: Partial<NostrEvent>): NostrEventDB {
  const event = fakeEvent(data)
  return parseEventMetadata(event)
}

export function fakeSignature(wrappedEvent: NostrEvent, key?: Uint8Array): NostrEventDB {
  return finalizeEvent(fakeEventMeta(wrappedEvent), key || generateSecretKey()) as NostrEventDB
}

const WORD_BANK = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
]

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export function fakeText(paragraphs = 2, sentencesPerParagraph = 4, wordsPerSentence = 12) {
  const nextWord = () => WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)] || 'nostr'

  return Array.from({ length: paragraphs }, () =>
    Array.from(
      { length: sentencesPerParagraph },
      () => `${capitalize(Array.from({ length: wordsPerSentence }, nextWord).join(' '))}.`,
    ).join(' '),
  ).join('\n\n')
}
