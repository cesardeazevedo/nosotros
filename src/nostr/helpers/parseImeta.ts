import type { NostrEvent } from 'nostr-tools'

export type IMetaFields = {
  url?: string
  m?: string
  x?: string
  blurhash?: string
  bh?: string
  dim?: {
    width: number
    height: number
  }
  alt?: string
  summary?: string
  fallback?: string[]
  thumb?: string
}
export type IMetaTags = Record<string, IMetaFields>

const IMETA_RENAME: Partial<Record<keyof IMetaFields, keyof IMetaFields>> = {
  bh: 'blurhash',
}

export function parseImeta(tags: NostrEvent['tags']) {
  const metadata: IMetaTags = {}
  for (const tag of tags) {
    if (tag[0] === 'imeta') {
      let url
      for (const [_key, value] of tag.map((x) => x.split(/ (.+)/)) as Array<[keyof IMetaFields, string]>) {
        const key = IMETA_RENAME[_key] || _key
        if (key === 'url') {
          url = value
          metadata[url] ??= {}
        }
        if (value && url) {
          switch (key) {
            case 'fallback': {
              metadata[url].fallback = [...(metadata[url].fallback || []), value]
              break
            }
            case 'dim': {
              const dimensions = value.split('x')
              metadata[url].dim = {
                width: parseInt(dimensions[0]),
                height: parseInt(dimensions[1]),
              }
              break
            }
            default: {
              metadata[url][key] = value
              break
            }
          }
        }
      }
    }
  }
  return metadata
}
