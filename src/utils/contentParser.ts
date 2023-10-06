import LinkifyIt from 'linkify-it'
import { marked } from 'marked'
import { Event, parseReferences } from 'nostr-tools'

import tlds from 'tlds'
import { replaceToArray } from 'utils/utils'

const linkify = LinkifyIt().tlds(tlds).add('git:', 'http:')

type References = ReturnType<typeof parseReferences>

export enum TokenType {
  TAG = 'tag',
  URL = 'url',
  IMAGE = 'image',
  VIDEO = 'video',
  MENTION = 'mention',
  TEXT = 'text',
  NOTE = 'note',
  // Markdown Tokens (NIP-23)
  TITLE = 'title',
  PARAGRAPH = 'paragraph',
  DIVIDER = 'divider',
  LIST = 'list',
  CODE = 'code',
  CODESPAN = 'codespan',
  BLOCKQUOTE = 'blockquote',
  STRONG = 'strong',
  EM = 'em',
}

type ArrayTokens = TokenType.TEXT | TokenType.PARAGRAPH | TokenType.LIST | TokenType.BLOCKQUOTE
type SingleTokens = Exclude<TokenType, ArrayTokens>

export type Token =
  | { kind: SingleTokens; content: string; href?: string; author?: string }
  | { kind: ArrayTokens; content: PartiallyParsed }

type PartiallyParsed = Array<string | Token>
export type ParsedContent = Array<Token>

export function groupContent(
  parsed: (string | Token)[],
  textGroup = [TokenType.MENTION, TokenType.TAG],
): ParsedContent {
  const result: ParsedContent = []
  parsed.forEach((current) => {
    const prev = result[result.length - 1]
    if (typeof current === 'string' || textGroup.includes(current.kind)) {
      if (!prev) {
        result.push({ kind: TokenType.TEXT, content: [current] })
      } else if (prev.kind === TokenType.TEXT) {
        prev.content.push(current)
      } else {
        result.push({ kind: TokenType.TEXT, content: [current] })
      }
    } else if (prev && prev.kind === TokenType.TEXT && current.kind === TokenType.URL) {
      const isInsideParenthesis = prev?.content?.[prev.content?.length - 1].toString().trim().endsWith('(')
      if (isInsideParenthesis) {
        prev.content.push(current)
      } else {
        result.push(current)
      }
    } else {
      result.push(current)
    }
  })
  return result
}

const REGEX_IMAGES = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|gif|png|bmp|svg|webp)[\\?!]?(?:&?[^=&]*=[^=&]*)*$/i
const REGEX_VIDEOS = /(http(s?):)([/|.|\w|\s|-])*\.(?:webm|mp4|ogg|mov)[\\?!]?(?:&?[^=&]*=[^=&]*)*$/i
const REGEX_TAG = /(#\w+)/g

function replaceReferences(references: References, content: string) {
  return references.reduce(
    (acc: PartiallyParsed, ref) => {
      const { profile, event } = ref
      const result = replaceToArray(acc, ref.text, () => {
        return profile
          ? ({ kind: TokenType.MENTION, content: profile.pubkey } as Token)
          : event
          ? ({ kind: TokenType.NOTE, content: event.id, author: event.author } as Token)
          : acc
      }) as Array<string | Token>
      return result
    },
    [content],
  )
}

function parseNostrReferences(event: Event): PartiallyParsed {
  const references = parseReferences(event)
  if (references.length > 0) {
    return replaceReferences(references, event.content)
  }
  return [event.content]
}

function parseLinks(content: string, parsed: PartiallyParsed): PartiallyParsed {
  const matches = linkify.match(content)
  if (matches && matches.length > 0) {
    return matches?.reduce((acc: PartiallyParsed, match) => {
      return replaceToArray(
        acc,
        match.text,
        // TODO: Handle images with a proper url preview + mimetype
        () =>
          ({
            kind: REGEX_IMAGES.test(match.url)
              ? TokenType.IMAGE
              : REGEX_VIDEOS.test(match.url)
              ? TokenType.VIDEO
              : TokenType.URL,
            content: match.text,
            href: match.url,
          }) as Token,
      )
    }, parsed)
  }
  return parsed
}

function parseTags(parsed: PartiallyParsed): PartiallyParsed {
  return replaceToArray(parsed, REGEX_TAG, (content) => ({ kind: TokenType.TAG, content }) as Token)
}

export function parseContent(event: Event): ParsedContent {
  // Parse nostr links and mentions
  const parsed = parseNostrReferences(event)
  // Parse HTTP links
  const linked = parseLinks(event.content, parsed)
  // Parse #tags
  const tagged = parseTags(linked)
  // Group text, mentions and tags into a single token
  return groupContent(tagged)
}

export function parseUserAbout(content: string): ParsedContent {
  const linked = parseLinks(content, [content])
  // Parse #tags
  const tagged = parseTags(linked)
  // Group text, mentions and tags into a single token
  return groupContent(tagged, [TokenType.TAG, TokenType.URL, TokenType.MENTION])
}

export function parseMarkdown(event: Event) {
  const references = parseReferences(event)
  const lexer = marked.lexer(event.content)
  const textGroup = [
    TokenType.TAG,
    TokenType.URL,
    TokenType.MENTION,
    TokenType.CODESPAN,
    TokenType.EM,
    TokenType.STRONG,
  ]
  // Parse marked lexer format into our own format
  function parseLexer(lexer: marked.Token[]) {
    const result: PartiallyParsed = []
    for (const token of lexer) {
      switch (token.type) {
        case 'heading': {
          result.push({ kind: TokenType.TITLE, content: token.text })
          break
        }
        case 'hr': {
          result.push({ kind: TokenType.DIVIDER, content: '' })
          break
        }
        case 'text': {
          if ('tokens' in token) {
            result.push(...groupContent(parseLexer(token.tokens || []), textGroup))
          } else {
            result.push(...replaceReferences(references, token.text))
          }
          break
        }
        case 'code': {
          result.push({ kind: TokenType.CODE, content: token.text })
          break
        }
        case 'codespan': {
          result.push({ kind: TokenType.CODESPAN, content: token.text })
          break
        }
        case 'strong': {
          result.push({ kind: TokenType.STRONG, content: token.text })
          break
        }
        case 'em': {
          result.push({ kind: TokenType.EM, content: token.text })
          break
        }
        case 'link': {
          result.push({ kind: TokenType.URL, content: token.href, href: token.href })
          break
        }
        case 'image': {
          result.push({ kind: TokenType.IMAGE, content: token.href, href: token.href })
          break
        }
        case 'paragraph':
          result.push({ kind: TokenType.PARAGRAPH, content: groupContent(parseLexer(token.tokens), textGroup) })
          break
        case 'list': {
          result.push({ kind: TokenType.LIST, content: groupContent(parseLexer(token.items), textGroup) })
          break
        }
        case 'list_item': {
          result.push(...groupContent(parseLexer(token.tokens), textGroup))
          break
        }
        case 'blockquote': {
          result.push({ kind: TokenType.BLOCKQUOTE, content: groupContent(parseLexer(token.tokens), textGroup) })
        }
      }
    }
    return result
  }
  return groupContent(parseLexer(lexer), textGroup)
}
