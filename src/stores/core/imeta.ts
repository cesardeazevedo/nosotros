import type { Event } from 'nostr-tools'
import { dedupe } from 'utils/utils'

export type IMetaFileds = {
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

export type IMetaTags = Record<string, IMetaFileds>

type KeyOf = keyof IMetaFileds

const RENAME: Partial<Record<KeyOf, KeyOf>> = {
  bh: 'blurhash',
}

export class IMeta {
  tags: Event['tags']
  metadata: IMetaTags

  constructor(tags: Event['tags'], metadata?: IMetaTags) {
    this.tags = tags
    this.metadata = metadata || {}
  }

  getMimeType(url: string) {
    return this.metadata?.[url]?.m
  }

  public parse() {
    for (const tag of this.tags) {
      if (tag[0] === 'imeta') {
        let url
        for (const [_key, value] of tag.map((x) => x.split(/ (.+)/)) as Array<[keyof IMetaFileds, string]>) {
          const key = RENAME[_key] || _key
          if (key === 'url') {
            url = value
            this.metadata[url] ??= {}
          }
          if (value && url) {
            switch (key) {
              case 'fallback': {
                this.metadata[url].fallback = dedupe(this.metadata[url].fallback, [value])
                break
              }
              case 'dim': {
                this.metadata[url].dim = this.parseDim(value)
                break
              }
              default: {
                this.metadata[url][key] = value
                break
              }
            }
          }
        }
      }
    }
    return this.metadata
  }

  private parseDim(dim: string) {
    const dimensions = dim.split('x')
    return {
      width: parseInt(dimensions[0]),
      height: parseInt(dimensions[1]),
    }
  }
}
