import { nip19 } from 'nostr-tools'
import type { AddressPointer, EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19'

// nostr-tools doesn't export this
export type Prefixes = {
  nprofile: ProfilePointer
  nrelay: string
  nevent: EventPointer
  naddr: AddressPointer
  nsec: string
  npub: string
  note: string
}
type DecodeValue<Prefix extends keyof Prefixes> = {
  type: Prefix
  data: Prefixes[Prefix]
}

export type Nevent = `nevent1${string}`
export type Nprofile = `nprofile1${string}`
export type Nnote = `note1${string}`
export type Npub = `npub1${string}`

// Type guards
type Decoded = DecodeValue<keyof Prefixes>
export const isNpub = (decoded?: Decoded): decoded is DecodeValue<'npub'> => decoded?.type === 'npub'
export const isNevent = (decoded?: Decoded): decoded is DecodeValue<'nevent'> => decoded?.type === 'nevent'
export const isNprofile = (decoded?: Decoded): decoded is DecodeValue<'nprofile'> => decoded?.type === 'nprofile'
export const isNaddress = (decoded?: Decoded): decoded is DecodeValue<'naddr'> => decoded?.type === 'naddr'
export const isNote = (decoded?: Decoded): decoded is DecodeValue<'note'> => decoded?.type === 'note'

export function decodeNIP19<T extends keyof Prefixes>(data: `${T}1${string}` | undefined) {
  if (data) {
    try {
      return nip19.decode(data)
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
