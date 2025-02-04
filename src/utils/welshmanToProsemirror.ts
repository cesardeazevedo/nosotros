import { ParsedType, type Parsed } from '@welshman/content'
import { decode } from 'light-bolt11-decoder'
import type {
  ContentSchema,
  NAddrAttributes,
  NEventAttributes,
  Node,
  NProfileAttributes,
  ParagraphNode,
} from 'nostr-editor'
import { TLDs } from './tlds'

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|gif|png|bmp|svg|webp)$/
const VIDEO_EXTENSIONS = /\.(webm|mp4|ogg|mov)$/
const YOUTUBE_EMBED =
  /^(?:(?:https?:)?\/\/)?(?:(?:(?:www|m(?:usic)?)\.)?youtu(?:\.be|be\.com)\/(?:shorts\/|live\/|v\/|e(?:mbed)?\/|watch(?:\/|\?(?:\S+=\S+&)*v=)|oembed\?url=https?%3A\/\/(?:www|m(?:usic)?)\.youtube\.com\/watch\?(?:\S+=\S+&)*v%3D|attribution_link\?(?:\S+=\S+&)*u=(?:\/|%2F)watch(?:\?|%3F)v(?:=|%3D))?|www\.youtube-nocookie\.com\/embed\/)([\w-]{1})[?&#]?\S*$/
const TWITTER_EMBED = /^https?:\/\/(twitter|x)\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/

export type LinkKinds = 'text' | 'image' | 'video' | 'tweet' | 'youtube'

export function getLinkKind(url: string): LinkKinds {
  if (YOUTUBE_EMBED.test(url)) {
    return 'youtube'
  } else if (TWITTER_EMBED.test(url)) {
    return 'tweet'
  } else {
    try {
      const { pathname, origin } = new URL(url)
      const [, tld] = origin.split('.')
      return TLDs.has(tld)
        ? 'text'
        : IMAGE_EXTENSIONS.test(pathname)
          ? 'image'
          : VIDEO_EXTENSIONS.test(pathname)
            ? 'video'
            : 'text'
    } catch (error) {
      console.log('url parser error', error)
      return 'text'
    }
  }
}

export function welshmanToProseMirror(welshmanSchema: Parsed[], blockNodesOptions?: ParsedType[]) {
  const blockNodes = new Set(blockNodesOptions || [ParsedType.Event, ParsedType.Address, ParsedType.Invoice])

  const result = {
    type: 'doc',
    content: [],
  } as ContentSchema

  const nprofiles = [] as NProfileAttributes[]
  const nevents = [] as NEventAttributes[]
  const naddresses = [] as NAddrAttributes[]

  let currentParagraph = {
    type: 'paragraph',
    content: [],
  } as ParagraphNode & { content: Node[] }

  const pushParagraph = () => {
    if (currentParagraph.content.length > 0) {
      result.content.push(currentParagraph)
      currentParagraph = { type: 'paragraph', content: [] }
    }
  }

  welshmanSchema.forEach((node) => {
    if (blockNodes.has(node.type)) {
      pushParagraph()

      switch (node.type) {
        case ParsedType.Event: {
          const attrs = {
            ...node.value,
            bech32: node.raw,
          } as NEventAttributes
          result.content.push({ type: 'nevent', attrs })
          nevents.push(attrs)
          break
        }
        case ParsedType.Address: {
          const attrs = {
            ...node.value,
            bech32: node.raw,
          } as NAddrAttributes
          result.content.push({ type: 'naddr', attrs })
          naddresses.push(attrs)
          break
        }
        case ParsedType.Invoice: {
          result.content.push({
            type: 'bolt11',
            attrs: {
              bolt11: decode(node.raw),
              lnbc: node.raw,
            },
          })
          break
        }
      }
    } else {
      switch (node.type) {
        case ParsedType.Text: {
          currentParagraph.content.push({ type: 'text', text: node.value })
          break
        }
        case ParsedType.Code: {
          currentParagraph.content.push({ type: 'text', text: node.value, marks: [{ type: 'code' }] })
          break
        }
        case ParsedType.Newline: {
          if (node.raw === '\n\n') {
            currentParagraph.content.push({ type: 'hardBreak' })
            currentParagraph.content.push({ type: 'hardBreak' })
          } else {
            currentParagraph.content.push({ type: 'hardBreak' })
          }
          break
        }
        case ParsedType.Profile: {
          const attrs = {
            ...node.value,
            relays: node.value.relays || [],
            bech32: node.raw,
          } as NProfileAttributes
          nprofiles.push(attrs)
          currentParagraph.content.push({ type: 'nprofile', attrs })
          break
        }
        case ParsedType.Link: {
          const url = node.value.url.toString()
          const type = getLinkKind(url)
          switch (type) {
            case 'text': {
              currentParagraph.content.push({
                type: 'text',
                text: node.raw,
                marks: [{ type: 'link', attrs: { href: node.value.url.href } }],
              })
              break
            }
            case 'image': {
              pushParagraph()
              result.content.push({
                type: 'image',
                attrs: {
                  src: url,
                },
              })
              break
            }
            case 'video': {
              pushParagraph()
              result.content.push({
                type: 'video',
                // @ts-ignore
                attrs: {
                  src: url,
                },
              })
              break
            }
            case 'tweet': {
              pushParagraph()
              result.content.push({
                type: 'tweet',
                attrs: {
                  src: url,
                },
              })
              break
            }
            case 'youtube': {
              pushParagraph()
              result.content.push({
                type: 'youtube',
                attrs: {
                  src: url,
                },
              })
              break
            }
          }
          break
        }
        case ParsedType.Topic:
          currentParagraph.content.push({
            type: 'text',
            text: node.raw,
            marks: [
              {
                type: 'tag',
                attrs: {
                  tag: `#${node.value}`,
                },
              },
            ],
          })
          break
        default:
          break
      }
    }
  })

  pushParagraph()

  return {
    contentSchema: result,
    nevents,
    nprofiles,
    naddresses,
  }
}
