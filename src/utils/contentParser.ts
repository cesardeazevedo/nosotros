// forked from: https://github.com/coracle-social/welshman/blob/master/packages/content/src/parser.ts
import type { ContentCustomSchema, ImageCustomNode, VideoCustomNode } from '@/nostr/types'
import type { NAddrAttributes, NEventAttributes, Node, NProfileAttributes, ParagraphNode } from 'nostr-editor'
import { decode as decodeBolt11 } from 'light-bolt11-decoder'
import { decode } from "nostr-tools/nip19"

const fromNostrURI = (s: string) => s.replace(/^nostr:\/?\/?/, "")

export const urlIsMedia = (url: string) =>
  Boolean(url.match(/\.(jpe?g|png|wav|mp3|mp4|mov|avi|webm|webp|gif|bmp|svg)$/))

// Copy some types from nostr-tools because I can't import them

export type AddressPointer = {
  identifier: string
  pubkey: string
  kind: number
  relays?: string[]
}

export type EventPointer = {
  id: string
  relays?: string[]
  author?: string
  kind?: number
}

export type ProfilePointer = {
  pubkey: string
  relays?: string[]
}

// Types

export type ParseContext = {
  prevTextEndsWithSlash?: boolean
  prevTextEndsWithMarkdownLinkOpen?: boolean
  tags: string[][]
}

export enum ParsedType {
  Address = "address",
  Cashu = "cashu",
  Code = "code",
  Ellipsis = "ellipsis",
  Emoji = "emoji",
  Event = "event",
  Invoice = "invoice",
  Link = "link",
  LinkGrid = "link-grid",
  Newline = "newline",
  Profile = "profile",
  Text = "text",
  Topic = "topic",
}

export type ParsedBase = {
  raw: string
}

export type ParsedCashu = ParsedBase & {
  type: ParsedType.Cashu
  value: string
}

export type ParsedCode = ParsedBase & {
  type: ParsedType.Code
  value: string
}

export type ParsedEllipsis = ParsedBase & {
  type: ParsedType.Ellipsis
  value: string
}

export type ParsedEmojiValue = {
  name: string
  url?: string
}

export type ParsedEmoji = ParsedBase & {
  type: ParsedType.Emoji
  value: ParsedEmojiValue
}

export type ParsedInvoice = ParsedBase & {
  type: ParsedType.Invoice
  value: string
}

export type ParsedLinkValue = {
  url: URL
  meta: Record<string, string>
  kind: LinkKinds
}

export type ParsedLinkGridValue = {
  links: ParsedLinkValue[]
}

export type ParsedLink = ParsedBase & {
  type: ParsedType.Link
  value: ParsedLinkValue
}

export type ParsedLinkGrid = ParsedBase & {
  type: ParsedType.LinkGrid
  value: ParsedLinkGridValue
}

export type ParsedNewline = ParsedBase & {
  type: ParsedType.Newline
  value: string
}

export type ParsedText = ParsedBase & {
  type: ParsedType.Text
  value: string
}

export type ParsedTopic = ParsedBase & {
  type: ParsedType.Topic
  value: string
}

export type ParsedEvent = ParsedBase & {
  type: ParsedType.Event
  value: EventPointer
}

export type ParsedProfile = ParsedBase & {
  type: ParsedType.Profile
  value: ProfilePointer
}

export type ParsedAddress = ParsedBase & {
  type: ParsedType.Address
  value: AddressPointer
}

export type Parsed =
  | ParsedAddress
  | ParsedCashu
  | ParsedCode
  | ParsedEllipsis
  | ParsedEmoji
  | ParsedEvent
  | ParsedInvoice
  | ParsedLink
  | ParsedLinkGrid
  | ParsedNewline
  | ParsedProfile
  | ParsedText
  | ParsedTopic

// Matchers

export const isAddress = (parsed: Parsed): parsed is ParsedAddress =>
  parsed.type === ParsedType.Address
export const isCashu = (parsed: Parsed): parsed is ParsedCashu => parsed.type === ParsedType.Cashu
export const isCode = (parsed: Parsed): parsed is ParsedCode => parsed.type === ParsedType.Code
export const isEllipsis = (parsed: Parsed): parsed is ParsedEllipsis =>
  parsed.type === ParsedType.Ellipsis
export const isEmoji = (parsed: Parsed): parsed is ParsedEmoji => parsed.type === ParsedType.Emoji
export const isEvent = (parsed: Parsed): parsed is ParsedEvent => parsed.type === ParsedType.Event
export const isInvoice = (parsed: Parsed): parsed is ParsedInvoice =>
  parsed.type === ParsedType.Invoice
export const isLink = (parsed: Parsed): parsed is ParsedLink => parsed.type === ParsedType.Link
export const isImage = (parsed: Parsed): parsed is ParsedLink =>
  isLink(parsed) && Boolean(parsed.value.url.toString().match(/\.(jpe?g|png|gif|webp)$/))
export const isLinkGrid = (parsed: Parsed): parsed is ParsedLinkGrid =>
  parsed.type === ParsedType.LinkGrid
export const isNewline = (parsed: Parsed): parsed is ParsedNewline =>
  parsed.type === ParsedType.Newline
export const isProfile = (parsed: Parsed): parsed is ParsedProfile =>
  parsed.type === ParsedType.Profile
export const isText = (parsed: Parsed): parsed is ParsedText => parsed.type === ParsedType.Text
export const isTopic = (parsed: Parsed): parsed is ParsedTopic => parsed.type === ParsedType.Topic

// Parsers for known formats

export const parseAddress = (text: string, context: ParseContext): ParsedAddress | void => {
  void context
  const [naddr] = text.match(/^(web\+)?(nostr:)naddr1[\d\w]+/i) || []

  if (naddr) {
    try {
      const { data } = decode(fromNostrURI(naddr))

      return { type: ParsedType.Address, value: data as AddressPointer, raw: naddr }
    } catch {
      // Pass
    }
  }
}

export const parseCashu = (text: string, context: ParseContext): ParsedCashu | void => {
  void context
  const [value] = text.match(/^cashu:cashu[-\d\w=]{50,5000}/i) || []

  if (value) {
    return { type: ParsedType.Cashu, value, raw: value }
  }
}

export const parseCodeBlock = (text: string, context: ParseContext): ParsedCode | void => {
  void context
  const [raw, value] = text.match(/^```([^]*?)```/i) || []

  if (raw) {
    return { type: ParsedType.Code, value, raw }
  }
}

export const parseCodeInline = (text: string, context: ParseContext): ParsedCode | void => {
  void context
  const [raw, value] = text.match(/^`(.*?)`/i) || []

  if (raw) {
    return { type: ParsedType.Code, value, raw }
  }
}

export const parseEmoji = (text: string, context: ParseContext): ParsedEmoji | void => {
  const [raw, name] = text.match(/^:(\w+):/i) || []

  if (raw) {
    const url = context.tags.find(t => t[0] === "emoji" && t[1] === name)?.[2]

    return { type: ParsedType.Emoji, value: { name, url }, raw }
  }
}

export const parseEvent = (text: string, context: ParseContext): ParsedEvent | void => {
  void context
  const [entity] = text.match(/^(web\+)?(nostr:)n(event|ote)1[\d\w]+/i) || []

  if (entity) {
    try {
      const { type, data } = decode(fromNostrURI(entity))
      const value = type === "note" ? { id: data as string, relays: [] } : (data as EventPointer)

      return { type: ParsedType.Event, value, raw: entity }
    } catch {
      // Pass
    }
  }
}

export const parseInvoice = (text: string, context: ParseContext): ParsedInvoice | void => {
  void context
  const [raw, , value] = text.match(/^(lightning:)(ln(bc|url)[0-9a-z]{10,})/i) || []

  if (raw && value) {
    return { type: ParsedType.Invoice, value, raw }
  }
}

export const parseLink = (text: string, context: ParseContext): ParsedLink | void => {
  // Skip if it's just the end of a filepath
  if (context.prevTextEndsWithSlash || context.prevTextEndsWithMarkdownLinkOpen) {
    return
  }

  const matchWithProtocol = text.match(LINK_WITH_PROTOCOL_REGEX)
  const matchWithoutProtocol = text.match(LINK_WITHOUT_PROTOCOL_REGEX)
  const link = matchWithProtocol?.[0] || matchWithoutProtocol?.[0] || ""
  const isBareLink = !matchWithProtocol && !!matchWithoutProtocol

  // Skip url if it's an ellipse
  if (!link || link.match(/\.\./)) {
    return
  }
  if (isBareLink && !hasAllowedBareTld(link)) {
    return
  }

  // Skip it if it looks like an IP address but doesn't have a protocol
  if (link.match(/\d+\.\d+/) && !link.includes("://")) {
    return
  }

  // Parse using URL, make sure there's a protocol.
  let url: URL
  try {
    url = new URL(HAS_PROTOCOL_REGEX.test(link) ? link : "https://" + link)
  } catch {
    return
  }

  const meta: Record<string, string> =
    url.hash.length > 1 ? Object.fromEntries(new URLSearchParams(url.hash.slice(1)).entries()) : {}

  for (const tag of context.tags) {
    if (tag[0] === "imeta" && tag.find(t => t.includes(`url ${link}`))) {
      Object.assign(meta, Object.fromEntries(tag.slice(1).map((m: string) => m.split(" "))))
    }
  }

  return { type: ParsedType.Link, value: { url, meta, kind: getLinkKind(url) }, raw: link }
}

export const parseNewline = (text: string, context: ParseContext): ParsedNewline | void => {
  void context
  const [value] = text.match(/^\n+/) || []

  if (value) {
    return { type: ParsedType.Newline, value, raw: value }
  }
}

export const parseProfile = (text: string, context: ParseContext): ParsedProfile | void => {
  void context
  const [entity] = text.match(/^@?(web\+)?(nostr:)n(profile|pub)1[\d\w]+/i) || []

  if (entity) {
    try {
      const { type, data } = decode(fromNostrURI(entity.replace("@", "")))
      const value =
        type === "npub" ? { pubkey: data as string, relays: [] } : (data as ProfilePointer)

      return { type: ParsedType.Profile, value, raw: entity }
    } catch {
      // Pass
    }
  }
}

export const parseTopic = (text: string, context: ParseContext): ParsedTopic | void => {
  void context
  const [value] = text.match(/^#[^\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+/i) || []

  // Skip numeric topics
  if (value && !value.match(/^#\d+$/)) {
    return { type: ParsedType.Topic, value: value.slice(1), raw: value }
  }
}

// Parse other formats to known types

export const parseLegacyMention = (
  text: string,
  context: ParseContext,
): ParsedProfile | ParsedEvent | void => {
  const mentionMatch = text.match(/^#\[(\d+)\]/i) || []

  if (mentionMatch) {
    const [tag, value, url] = context.tags[parseInt(mentionMatch[1])] || []
    const relays = url ? [url] : []

    if (tag === "p") {
      return { type: ParsedType.Profile, value: { pubkey: value, relays }, raw: mentionMatch[0]! }
    }

    if (tag === "e") {
      return { type: ParsedType.Event, value: { id: value, relays }, raw: mentionMatch[0]! }
    }
  }
}

export const parsers = [
  parseNewline,
  parseLegacyMention,
  parseTopic,
  parseCodeBlock,
  parseCodeInline,
  parseAddress,
  parseProfile,
  parseEmoji,
  parseEvent,
  parseCashu,
  parseInvoice,
  parseLink,
]

const WORD_CHUNK_REGEX = /^[\w\d]+ ?/i
const WHITESPACE_REGEX = /\s/
const ALLOWED_BARE_TLDS = new Set([
  'com',
  'org',
  'net',
  'io',
  'ai',
  'app',
  'dev',
  'me',
  'co',
  'xyz',
  'news',
  'gg',
  'tv',
  'fm',
  'gov',
  'edu',
  'us',
])

const startsWithIgnoreCase = (value: string, prefix: string) =>
  value.length >= prefix.length && value.slice(0, prefix.length).toLowerCase() === prefix

const hasAllowedBareTld = (candidate: string) => {
  const host = candidate.split(/[/:?#]/, 1)[0]?.toLowerCase() || ''
  const dotIndex = host.lastIndexOf('.')
  if (dotIndex <= 0 || dotIndex === host.length - 1) {
    return false
  }
  const tld = host.slice(dotIndex + 1)
  return ALLOWED_BARE_TLDS.has(tld)
}

const likelyLinkStart = (raw: string) => {
  const whitespaceIndex = raw.search(WHITESPACE_REGEX)
  const segment = whitespaceIndex === -1 ? raw : raw.slice(0, whitespaceIndex)
  if (segment.length < 4) {
    return false
  }
  if (segment.includes('://')) {
    return true
  }
  const normalized = segment.replace(/[)\].,!?:;]+$/, '')
  return hasAllowedBareTld(normalized)
}

export const parseNext = (raw: string, context: ParseContext): Parsed | void => {
  const first = raw[0]
  switch (first) {
    case '\n':
      return parseNewline(raw, context)
    case '#':
      return parseLegacyMention(raw, context) || parseTopic(raw, context)
    case '`':
      return parseCodeBlock(raw, context) || parseCodeInline(raw, context)
    case ':':
      return parseEmoji(raw, context)
    case '@':
      return parseProfile(raw, context)
    default:
      break
  }

  if (startsWithIgnoreCase(raw, 'cashu:cashu')) {
    return parseCashu(raw, context) || parseLink(raw, context)
  }
  if (startsWithIgnoreCase(raw, 'lightning:ln')) {
    return parseInvoice(raw, context) || parseLink(raw, context)
  }
  if (startsWithIgnoreCase(raw, 'web+nostr:') || startsWithIgnoreCase(raw, 'nostr:')) {
    return parseAddress(raw, context) || parseProfile(raw, context) || parseEvent(raw, context)
  }
  if (likelyLinkStart(raw)) {
    return parseLink(raw, context)
  }

  // Fallback to preserve behavior for unusual prefixes.
  for (let i = 0; i < parsers.length; i++) {
    const result = parsers[i](raw, context)
    if (result) {
      return result
    }
  }
}

type LinkKinds = 'text' | 'image' | 'video' | 'tweet' | 'youtube' | 'spotify'

const LINK_WITH_PROTOCOL_REGEX = /^([a-z+:]{2,30}:\/\/)[-.~\w]+([^\s]*[^<>"'.,:\s)(]+)?/i
const LINK_WITHOUT_PROTOCOL_REGEX = /^\w+[-.~\w]+\.[\w]{2,6}([^\s]*[^<>"'.,:\s)(]+)?/i
const HAS_PROTOCOL_REGEX = /^\w+:\/\//

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|gif|png|bmp|svg|webp)$/
const VIDEO_EXTENSIONS = /\.(webm|mp4|ogg|mov)$/
const YOUTUBE_EMBED =
  /^(?:(?:https?:)?\/\/)?(?:(?:www\.|m(?:usic)?\.)?youtu(?:\.be|be\.com)|www\.youtube-nocookie\.com)\/(?:watch(?:\/|\?(?:[^#\s]*[?&])?v=)|shorts\/|live\/|v\/|e(?:mbed)?\/)([\w-]+)(?:[?&#][^\s]*)?$/i
const TWITTER_EMBED = /^https?:\/\/(twitter|x)\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/
const SPOTIFY_EMBED =
  /^https?:\/\/open\.spotify\.com\/embed\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/

function getLinkKind(url: URL): LinkKinds {
  const href = url.href
  if (YOUTUBE_EMBED.test(href)) {
    return 'youtube'
  }
  if (TWITTER_EMBED.test(href)) {
    return 'tweet'
  }
  if (SPOTIFY_EMBED.test(href)) {
    return 'spotify'
  }

  const { pathname } = url

  if (IMAGE_EXTENSIONS.test(pathname)) {
    return 'image'
  }
  if (VIDEO_EXTENSIONS.test(pathname)) {
    return 'video'
  }
  return 'text'
}

export function cleanParagraph(paragraph: ParagraphNode): ParagraphNode | null {
  if (!paragraph.content) {
    return null
  }
  const nodes = paragraph.content
  const isEmptyText = (node: Node) => node.type === 'text' && (node.text === '' || node.text === ' ')

  let start = 0
  while (start < nodes.length) {
    const node = nodes[start]
    if (node.type !== 'hardBreak' && !isEmptyText(node)) {
      break
    }
    start++
  }

  if (start === nodes.length) {
    return null
  }

  let end = nodes.length - 1
  while (end >= start) {
    const node = nodes[end]
    if (node.type !== 'hardBreak' && !isEmptyText(node)) {
      break
    }
    end--
  }

  const trimmedContent: Node[] = []
  for (let i = start; i <= end; i++) {
    const node = nodes[i]
    if (!isEmptyText(node)) {
      trimmedContent.push(node)
    }
  }

  return {
    type: 'paragraph',
    content: trimmedContent,
  }
}

// Main exports

export const parse = ({
  content = "",
  tags = [],
  markdown = false,
}: {
  content?: string
  tags?: string[][]
  markdown?: boolean
}) => {
  const context: ParseContext = { tags }
  const result = {
    type: 'doc',
    content: [],
  } as ContentCustomSchema

  const nprofiles = [] as NProfileAttributes[]
  const nevents = [] as NEventAttributes[]
  const naddresses = [] as NAddrAttributes[]

  let currentParagraph = {
    type: 'paragraph',
    content: [],
  } as ParagraphNode & { content: Node[] }
  let mediaIndex = 0
  let pendingMedia: Array<ImageCustomNode | VideoCustomNode> = []

  const flushPendingMedia = () => {
    if (pendingMedia.length === 0) {
      return
    }
    if (pendingMedia.length === 1) {
      result.content.push(pendingMedia[0])
    } else {
      result.content.push({
        type: 'mediaGroup',
        content: pendingMedia,
      })
    }
    pendingMedia = []
  }

  const pushBlockNode = (node: Record<string, unknown>) => {
    if (node.type === 'image' || node.type === 'video') {
      if (node.type === 'image') {
        pendingMedia.push({
          type: 'image',
          attrs: node.attrs as ImageCustomNode['attrs'],
          index: mediaIndex++,
        })
      } else {
        pendingMedia.push({
          type: 'video',
          attrs: node.attrs as VideoCustomNode['attrs'],
          index: mediaIndex++,
        })
      }
      return
    }
    flushPendingMedia()
    result.content.push(node as never)
  }

  const pushParagraph = () => {
    const trimmed = cleanParagraph(currentParagraph)
    if (trimmed && trimmed.type === 'paragraph' && trimmed.content?.length !== 0) {
      pushBlockNode(trimmed)
    }
    currentParagraph = { type: 'paragraph', content: [] }
  }

  const emitParsed = (parsed: Parsed) => {
    switch (parsed.type) {
      case ParsedType.Text: {
        currentParagraph.content.push({ type: 'text', text: parsed.value })
        break
      }
      case ParsedType.Code: {
        const isBlock = parsed.raw.startsWith('```')
        if (isBlock) {
          pushParagraph()
          pushBlockNode({
            type: 'codeBlock',
            attrs: {
              language: '',
            },
            content: [{ type: 'text', text: parsed.value }],
          })
        } else {
          currentParagraph.content.push({ type: 'text', text: parsed.value, marks: [{ type: 'code' }] })
        }
        break
      }
      case ParsedType.Newline: {
        if (parsed.raw === '\n\n') {
          currentParagraph.content.push({ type: 'hardBreak' })
          currentParagraph.content.push({ type: 'hardBreak' })
        } else {
          currentParagraph.content.push({ type: 'hardBreak' })
        }
        break
      }
      case ParsedType.Profile: {
        const attrs = {
          ...parsed.value,
          relays: parsed.value.relays || [],
          type: 'nprofile',
          bech32: fromNostrURI(parsed.raw.replace('@', '')),
        } as NProfileAttributes
        nprofiles.push(attrs)
        currentParagraph.content.push({ type: 'nprofile', attrs })
        break
      }
      case ParsedType.Event: {
        pushParagraph()
        const attrs = { ...parsed.value, bech32: parsed.raw } as NEventAttributes
        pushBlockNode({ type: 'nevent', attrs })
        nevents.push(attrs)
        break
      }
      case ParsedType.Address: {
        pushParagraph()
        const attrs = { ...parsed.value, bech32: parsed.raw } as NAddrAttributes
        pushBlockNode({ type: 'naddr', attrs })
        naddresses.push(attrs)
        break
      }
      case ParsedType.Invoice: {
        pushParagraph()
        try {
          pushBlockNode({
            type: 'bolt11',
            attrs: { bolt11: decodeBolt11(parsed.raw), lnbc: parsed.raw },
          })
        } catch (error) {
          console.error(error)
        }
        break
      }
      case ParsedType.Topic: {
        currentParagraph.content.push({
          type: 'text',
          text: parsed.raw,
          marks: [{ type: 'tag', attrs: { tag: `#${parsed.value}` } }],
        })
        break
      }
      case ParsedType.Link: {
        const url = parsed.value.url.toString()
        switch (parsed.value.kind) {
          case 'text': {
            currentParagraph.content.push({
              type: 'text',
              text: parsed.raw,
              marks: [{ type: 'link', attrs: { href: parsed.value.url.href } }],
            })
            break
          }
          case 'image': {
            pushParagraph()
            pushBlockNode({ type: 'image', attrs: { src: url } })
            break
          }
          case 'video': {
            pushParagraph()
            pushBlockNode({ type: 'video', attrs: { src: url } })
            break
          }
          case 'tweet': {
            pushParagraph()
            pushBlockNode({ type: 'tweet', attrs: { src: url } })
            break
          }
          case 'youtube': {
            pushParagraph()
            pushBlockNode({ type: 'youtube', attrs: { src: url } })
            break
          }
          case 'spotify': {
            pushParagraph()
            pushBlockNode({ type: 'spotify', attrs: { src: url } })
            break
          }
        }
        break
      }
      case ParsedType.Emoji: {
        currentParagraph.content.push({ type: 'text', text: parsed.raw })
        break
      }
      default:
        break
    }
  }

  const commitParsed = (parsed: Parsed) => {
    emitParsed(parsed)
    if (parsed.type === ParsedType.Text) {
      context.prevTextEndsWithSlash = parsed.value.endsWith("/")
      context.prevTextEndsWithMarkdownLinkOpen = parsed.value.endsWith('](')
      return
    }
    context.prevTextEndsWithSlash = false
    context.prevTextEndsWithMarkdownLinkOpen = false
  }

  let buffer = ""
  let remaining = content.trim() || tags.find(t => t[0] === "alt")?.[1] || ""

  while (remaining) {
    const firstCharCode = remaining.charCodeAt(0)
    const isWordStart =
      (firstCharCode >= 48 && firstCharCode <= 57) ||
      (firstCharCode >= 65 && firstCharCode <= 90) ||
      (firstCharCode >= 97 && firstCharCode <= 122) ||
      firstCharCode === 95

    if (
      isWordStart &&
      !startsWithIgnoreCase(remaining, 'web+nostr:') &&
      !startsWithIgnoreCase(remaining, 'nostr:') &&
      !startsWithIgnoreCase(remaining, 'cashu:cashu') &&
      !startsWithIgnoreCase(remaining, 'lightning:ln') &&
      !likelyLinkStart(remaining)
    ) {
      const [chunk] = remaining.match(WORD_CHUNK_REGEX) || [remaining[0]]
      buffer += chunk
      remaining = remaining.slice(chunk.length)
      continue
    }

    if (buffer.endsWith('](') && likelyLinkStart(remaining)) {
      const [chunk] = remaining.match(LINK_WITH_PROTOCOL_REGEX) ||
        remaining.match(LINK_WITHOUT_PROTOCOL_REGEX) || [remaining[0]]
      buffer += chunk
      remaining = remaining.slice(chunk.length)
      continue
    }

    const parsed = parseNext(remaining, context)

    if (parsed) {
      if (buffer) {
        const textParsed = { type: ParsedType.Text, value: buffer, raw: buffer } as ParsedText
        commitParsed(textParsed)
        buffer = ""
      }

      commitParsed(parsed)
      remaining = remaining.slice(parsed.raw.length)
    } else {
      // Instead of going character by character and re-running all the above regular expressions
      // a million times, try to match the next word and add it to the buffer
      const [match] = remaining.match(WORD_CHUNK_REGEX) || [remaining[0]]

      buffer += match
      remaining = remaining.slice(match.length)
    }
  }

  if (buffer) {
    const textParsed = { type: ParsedType.Text, value: buffer, raw: buffer } as ParsedText
    commitParsed(textParsed)
  }

  pushParagraph()
  flushPendingMedia()

  if (markdown) {
    result.content = transformMarkdownBlocks(result.content)
  }

  return {
    contentSchema: result,
    nevents,
    nprofiles,
    naddresses,
  }
}

type AnyNode = Record<string, unknown>

const LINK_MARK_ATTRS = {
  class: null,
  target: '_blank',
  rel: 'noopener noreferrer nofollow',
}

const HEADING_PREFIX_REGEX = /^(\s{0,3})(#{1,6})\s+/
const BULLET_PREFIX_REGEX = /^(\s*)([*-])\s+/
const HORIZONTAL_RULE_REGEX = /^\s{0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/
const BOLD_REGEX = /\*\*([^*\n]+)\*\*/
const ITALIC_REGEX = /\*([^*\n]+)\*/
const MD_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/

const getText = (node: AnyNode) => (node.type === 'text' && typeof node.text === 'string' ? node.text : '')

const cloneNode = (node: AnyNode): AnyNode => ({ ...node })

const removePrefixFromFirstText = (nodes: AnyNode[], prefixLength: number) => {
  const next = nodes.map(cloneNode)
  for (let i = 0; i < next.length; i++) {
    const node = next[i]
    if (node.type === 'text' && typeof node.text === 'string') {
      node.text = node.text.slice(prefixLength)
      break
    }
  }
  return next
}

const trimLeadingSpacesFromFirstText = (nodes: AnyNode[]) => {
  const next = nodes.map(cloneNode)
  for (let i = 0; i < next.length; i++) {
    const node = next[i]
    if (node.type === 'text' && typeof node.text === 'string') {
      node.text = node.text.replace(/^\s+/, '')
      break
    }
  }
  return next
}

const splitParagraphLines = (paragraph: AnyNode): AnyNode[][] => {
  const content = Array.isArray(paragraph.content) ? (paragraph.content as AnyNode[]) : []
  const lines: AnyNode[][] = [[]]
  for (let i = 0; i < content.length; i++) {
    const node = content[i]
    if (node.type === 'hardBreak') {
      lines.push([])
      continue
    }
    lines[lines.length - 1].push(node)
  }
  return lines
}

const parseInlineMarkdownText = (value: string): AnyNode[] => {
  const output: AnyNode[] = []
  let remaining = value
  while (remaining.length > 0) {
    const linkMatch = remaining.match(MD_LINK_REGEX)
    const boldMatch = remaining.match(BOLD_REGEX)
    const italicMatch = remaining.match(ITALIC_REGEX)

    const candidates = [linkMatch, boldMatch, italicMatch].filter(Boolean) as RegExpMatchArray[]
    if (candidates.length === 0) {
      output.push({ type: 'text', text: remaining })
      break
    }

    candidates.sort((a, b) => (a.index || 0) - (b.index || 0))
    const match = candidates[0]
    const index = match.index || 0
    if (index > 0) {
      output.push({ type: 'text', text: remaining.slice(0, index) })
    }

    if (match[0] === linkMatch?.[0]) {
      output.push({
        type: 'text',
        text: match[1],
        marks: [{ type: 'link', attrs: { href: match[2], ...LINK_MARK_ATTRS } }],
      })
    } else if (match[0] === boldMatch?.[0]) {
      output.push({ type: 'text', text: match[1], marks: [{ type: 'bold' }] })
    } else {
      output.push({ type: 'text', text: match[1], marks: [{ type: 'italic' }] })
    }

    remaining = remaining.slice(index + match[0].length)
  }
  return output
}

const transformInlineMarkdownNodes = (nodes: AnyNode[]): AnyNode[] => {
  const out: AnyNode[] = []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.type === 'text' && typeof node.text === 'string' && !Array.isArray(node.marks)) {
      out.push(...parseInlineMarkdownText(node.text))
      continue
    }
    out.push(node)
  }
  return out
}

const createListItem = (lineNodes: AnyNode[]) => {
  const inlineNodes = transformInlineMarkdownNodes(lineNodes)
  return {
    type: 'listItem',
    content: [{ type: 'paragraph', content: inlineNodes }],
  } as AnyNode
}

const transformMarkdownBlocks = (nodes: ContentCustomSchema['content']): ContentCustomSchema['content'] => {
  const output: AnyNode[] = []
  const listStack: Array<{ indent: number; node: AnyNode; lastItem: AnyNode | null }> = []
  let paragraphBuffer: AnyNode[] = []
  let markdownMode = false

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return
    }
    output.push({ type: 'paragraph', content: transformInlineMarkdownNodes(paragraphBuffer) })
    paragraphBuffer = []
  }

  const flushLists = () => {
    while (listStack.length > 0) {
      const list = listStack.shift()
      if (list) {
        output.push(list.node)
      }
    }
  }

  const addListLine = (indent: number, lineNodes: AnyNode[]) => {
    while (listStack.length > 0 && indent < listStack[listStack.length - 1].indent) {
      listStack.pop()
    }

    if (listStack.length === 0 || indent > listStack[listStack.length - 1].indent) {
      const newList: AnyNode = { type: 'bulletList', attrs: { tight: true }, content: [] }
      if (listStack.length > 0 && listStack[listStack.length - 1].lastItem) {
        const parentItem = listStack[listStack.length - 1].lastItem!
        const parentContent = (parentItem.content as AnyNode[]) || []
        parentContent.push(newList)
        parentItem.content = parentContent
      }
      listStack.push({ indent, node: newList, lastItem: null })
    }

    const current = listStack[listStack.length - 1]
    const listItem = createListItem(lineNodes)
      ; (current.node.content as AnyNode[]).push(listItem)
    current.lastItem = listItem
  }

  const isMarkdownBlockLine = (lineNodes: AnyNode[]) => {
    if (lineNodes.length === 0) {
      return false
    }
    const firstText = getText(lineNodes[0])
    if (firstText.length === 0) {
      return false
    }
    return (
      HEADING_PREFIX_REGEX.test(firstText) ||
      BULLET_PREFIX_REGEX.test(firstText) ||
      (HORIZONTAL_RULE_REGEX.test(firstText) && lineNodes.every((n) => n.type === 'text'))
    )
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.type !== 'paragraph') {
      flushParagraph()
      flushLists()
      output.push(node)
      markdownMode = false
      continue
    }

    const lines = splitParagraphLines(node)
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const lineNodes = lines[lineIndex]
      if (lineNodes.length === 0) {
        const nextNonEmptyLine = lines.slice(lineIndex + 1).find((nextLine) => nextLine.length > 0)
        const shouldPreservePlainSpacing =
          !markdownMode &&
          listStack.length === 0 &&
          paragraphBuffer.length > 0 &&
          !!nextNonEmptyLine &&
          !isMarkdownBlockLine(nextNonEmptyLine)
        if (shouldPreservePlainSpacing) {
          // Preserve plain-text paragraph spacing as double hard breaks.
          paragraphBuffer.push({ type: 'hardBreak' }, { type: 'hardBreak' })
          continue
        }
        flushParagraph()
        flushLists()
        continue
      }

      const firstText = getText(lineNodes[0])
      if (firstText.length === 0) {
        flushParagraph()
        flushLists()
        paragraphBuffer.push(...lineNodes)
        continue
      }

      const headingMatch = firstText.match(HEADING_PREFIX_REGEX)
      if (headingMatch) {
        flushParagraph()
        flushLists()
        markdownMode = true
        const level = headingMatch[2].length
        const trimmedNodes = removePrefixFromFirstText(lineNodes, headingMatch[0].length)
        output.push({
          type: 'heading',
          attrs: { level },
          content: transformInlineMarkdownNodes(trimmedNodes),
        })
        continue
      }

      if (HORIZONTAL_RULE_REGEX.test(firstText) && lineNodes.every((n) => n.type === 'text')) {
        flushParagraph()
        flushLists()
        markdownMode = true
        output.push({ type: 'horizontalRule' })
        continue
      }

      const listMatch = firstText.match(BULLET_PREFIX_REGEX)
      if (listMatch) {
        flushParagraph()
        markdownMode = true
        const indent = listMatch[1].length
        const trimmedNodes = removePrefixFromFirstText(lineNodes, listMatch[0].length)
        addListLine(indent, trimmedNodes)
        continue
      }

      if (listStack.length > 0) {
        flushLists()
      }
      const paragraphLineNodes =
        markdownMode && paragraphBuffer.length === 0 ? trimLeadingSpacesFromFirstText(lineNodes) : lineNodes
      if (paragraphBuffer.length > 0 && paragraphBuffer[paragraphBuffer.length - 1]?.type !== 'hardBreak') {
        paragraphBuffer.push({ type: 'hardBreak' })
      }
      paragraphBuffer.push(...paragraphLineNodes)
    }
  }

  flushParagraph()
  flushLists()
  return output as ContentCustomSchema['content']
}

type TruncateOpts = {
  minLength?: number
  maxLength?: number
  mediaLength?: number
  entityLength?: number
}

export const truncate = (
  content: Parsed[],
  { minLength = 500, maxLength = 700, mediaLength = 200, entityLength = 30 }: TruncateOpts = {},
) => {
  // Get a list of content sizes so we know where to truncate
  // Non-plaintext things might take up more or less room if rendered
  const sizes = content.map((parsed: Parsed) => {
    switch (parsed.type) {
      case ParsedType.Link:
      case ParsedType.LinkGrid:
      case ParsedType.Cashu:
      case ParsedType.Invoice:
        return mediaLength
      case ParsedType.Event:
      case ParsedType.Address:
      case ParsedType.Profile:
        return entityLength
      case ParsedType.Emoji:
        return parsed.value.name.length
      default:
        return parsed.value.length
    }
  })

  // If total size fits inside our max, we're done
  if (sizes.reduce((r, x) => r + x, 0) < maxLength) {
    return content
  }

  let currentSize = 0

  // Otherwise, truncate more then necessary so that when the user expands the note
  // they have more than just a tiny bit to look at. Truncating a single word is annoying.
  sizes.every((size, i) => {
    currentSize += size

    if (currentSize > minLength) {
      content = content
        .slice(0, Math.max(1, i + 1))
        .concat({ type: ParsedType.Ellipsis, value: "…", raw: "" })

      return false
    }

    return true
  })

  return content
}

export const reduceLinks = (content: Parsed[]): Parsed[] => {
  const result: Parsed[] = []
  const buffer: ParsedLinkValue[] = []

  for (const parsed of content) {
    const prev = result[result.length - 1]

    // If we have a link and we're in our own block, start a grid
    if (isLink(parsed) && (!prev || isNewline(prev))) {
      buffer.push(parsed.value)
      continue
    }

    // Ignore newlines and empty space if we're building a grid
    if (isNewline(parsed) && buffer.length > 0) continue
    if (isText(parsed) && !parsed.value.trim() && buffer.length > 0) continue

    if (buffer.length > 0) {
      result.push({ type: ParsedType.LinkGrid, value: { links: buffer.splice(0) }, raw: "" })
    }

    result.push(parsed)
  }

  if (buffer.length > 0) {
    result.push({ type: ParsedType.LinkGrid, value: { links: buffer.splice(0) }, raw: "" })
  }

  return result
}
