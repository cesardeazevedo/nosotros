import { Kind } from 'constants/kinds'
import LinkifyIt from 'linkify-it'
import { marked } from 'marked'
import { Event as NostrEvent, parseReferences as parseNostrReferences } from 'nostr-tools'
import { IMeta } from 'stores/core/imeta'
import tlds from 'tlds' assert { type: 'json' }
import { dedupe, replaceToArray } from './utils'

const linkify = LinkifyIt().tlds(tlds).add('git:', 'http:')

export type NostrReferences = ReturnType<typeof parseNostrReferences>

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

interface TokenBase {
  kind:
    | TokenType.TAG
    | TokenType.STRONG
    | TokenType.EM
    | TokenType.CODE
    | TokenType.CODESPAN
    | TokenType.TITLE
    | TokenType.DIVIDER
  content: string
}

export interface TokenText {
  kind: TokenType.TEXT | TokenType.PARAGRAPH | TokenType.LIST | TokenType.BLOCKQUOTE
  content: Array<string | Token>
}

export interface TokenNote {
  kind: TokenType.NOTE
  content: string
  author: string | undefined
  relays: string[]
}

export interface TokenMention {
  kind: TokenType.MENTION
  content: string
  relays: string[]
}

export interface TokenURL {
  kind: TokenType.URL | TokenType.IMAGE | TokenType.VIDEO
  content: string
  href: string
}

export type Token = TokenBase | TokenText | TokenMention | TokenNote | TokenURL

export type PartiallyParsed = Array<string | Token>
export type ParsedContent = Array<Token>

const REGEX_IMAGES = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|gif|png|bmp|svg|webp)[\\?!]?(?:&?[^=&]*=[^=&]*)*$/i
const REGEX_VIDEOS = /(http(s?):)([/|.|\w|\s|-])*\.(?:webm|mp4|ogg|mov)[\\?!]?(?:&?[^=&]*=[^=&]*)*$/i
const REGEX_TAG = /(#\w+)/g

const MIMETYPE_TOKEN: Record<string, TokenType.IMAGE | TokenType.VIDEO> = {
  image: TokenType.IMAGE,
  video: TokenType.VIDEO,
}

export class ContentParser {
  event: NostrEvent
  imeta?: IMeta

  parsed: ParsedContent = []
  tokens: PartiallyParsed = []
  hasMedia: boolean

  references: NostrReferences = []
  links?: LinkifyIt.Match[] | null

  constructor(event: NostrEvent, imeta?: IMeta) {
    this.event = event
    this.imeta = imeta
    this.hasMedia = false
  }

  static deserialize(event: NostrEvent, content: ParsedContent, references: NostrReferences) {
    const instance = new ContentParser(event)
    instance.parsed = content
    instance.references = references
    return instance
  }

  get mentionedAuthors() {
    return dedupe(
      this.references.map((ref) => ref.profile?.pubkey),
      this.references.map((ref) => ref.event?.author),
    )
  }

  get mentionedNotes() {
    return dedupe(this.references.map((ref) => ref.event?.id))
  }

  private getUrlKind(url: string) {
    const mimetype = this.imeta?.getMimeType(url)?.split('/')[0]
    if (mimetype) {
      return MIMETYPE_TOKEN[mimetype]
    }
    return REGEX_IMAGES.test(url) ? TokenType.IMAGE : REGEX_VIDEOS.test(url) ? TokenType.VIDEO : TokenType.URL
  }

  private groupTextTokens(tokens: PartiallyParsed, textGroup: Array<TokenType>) {
    const result: ParsedContent = []
    tokens.forEach((current) => {
      const prev = result[result.length - 1]
      if (typeof current === 'string' || textGroup.includes(current.kind)) {
        if (!prev) {
          result.push({ kind: TokenType.TEXT, content: [current] })
        } else if (prev.kind === TokenType.TEXT) {
          prev.content.push(current)
        } else {
          result.push({ kind: TokenType.TEXT, content: [current] })
        }
      } else {
        result.push(current)
      }
    })
    return result
  }

  private replaceReferences(tokens: PartiallyParsed) {
    if (this.references) {
      return this.references.reduce<PartiallyParsed>((acc, { text, profile, event }) => {
        return replaceToArray(acc, text, () => {
          if (profile) {
            return { kind: TokenType.MENTION, content: profile.pubkey, relays: profile.relays } as Token
          } else if (event) {
            return {
              kind: TokenType.NOTE,
              content: event.id,
              author: event.author,
              relays: event.relays || [],
            } as Token
          } else {
            return acc
          }
        }) as PartiallyParsed
      }, tokens)
    }
    return tokens
  }

  private replaceLinks() {
    if (this.links && this.links.length > 0) {
      return this.links.reduce((acc: PartiallyParsed, match) => {
        return replaceToArray(acc, match.text, () => {
          const kind = this.getUrlKind(match.url)
          this.hasMedia = this.hasMedia || kind === TokenType.IMAGE || kind === TokenType.VIDEO
          return {
            kind,
            content: match.text,
            href: match.url,
          } as Token
        })
      }, this.tokens)
    }
    return this.tokens
  }

  private replaceTags() {
    return replaceToArray(this.tokens, REGEX_TAG, (content) => ({ kind: TokenType.TAG, content }) as Token)
  }

  private parseLinks(content: string) {
    return linkify.match(content)
  }

  private parseReferences(event: NostrEvent) {
    this.references = parseNostrReferences(event)
  }

  public parse() {
    switch (this.event.kind) {
      case Kind.Text:
        this.parseNote()
        break
      case Kind.Article:
        this.parseMarkdown()
        break
      case Kind.Metadata:
        this.parseUserAbout()
        break
      default:
        break
    }
    return this.parsed
  }

  private parseNote() {
    this.parseReferences(this.event)
    this.tokens = [this.event.content]
    this.links = this.parseLinks(this.event.content)

    this.tokens = this.replaceReferences(this.tokens)
    this.tokens = this.replaceLinks()
    this.tokens = this.replaceTags()
    this.parsed = this.groupTextTokens(this.tokens, [TokenType.URL, TokenType.MENTION, TokenType.TAG])
    return this.parsed
  }

  private parseUserAbout() {
    const about = JSON.parse(this.event.content || '{}').about
    if (about) {
      this.tokens = [about]
      this.links = this.parseLinks(about)
      this.tokens = this.replaceLinks()
      this.tokens = this.replaceTags()
      this.parsed = this.groupTextTokens(this.tokens, [TokenType.TAG, TokenType.URL, TokenType.MENTION])
    }
    return this.parsed
  }

  private parseMarkdown() {
    this.parseReferences(this.event)
    const lexer = marked.lexer(this.event.content)
    const textGroup = [
      TokenType.TAG,
      TokenType.URL,
      TokenType.MENTION,
      TokenType.CODESPAN,
      TokenType.EM,
      TokenType.STRONG,
    ]
    // Parse marked lexer format into our own format
    const parseLexer = (lexer: marked.Token[]) => {
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
              result.push(...this.groupTextTokens(parseLexer(token.tokens || []), textGroup))
            } else {
              result.push(...this.replaceReferences([token.text]))
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
            result.push({ kind: this.getUrlKind(token.href), content: token.href, href: token.href })
            break
          }
          case 'image': {
            result.push({ kind: TokenType.IMAGE, content: token.href, href: token.href })
            break
          }
          case 'paragraph':
            result.push({
              kind: TokenType.PARAGRAPH,
              content: this.groupTextTokens(parseLexer(token.tokens), textGroup),
            })
            break
          case 'list': {
            result.push({ kind: TokenType.LIST, content: this.groupTextTokens(parseLexer(token.items), textGroup) })
            break
          }
          case 'list_item': {
            result.push(...this.groupTextTokens(parseLexer(token.tokens), textGroup))
            break
          }
          case 'blockquote': {
            result.push({
              kind: TokenType.BLOCKQUOTE,
              content: this.groupTextTokens(parseLexer(token.tokens), textGroup),
            })
          }
        }
      }
      return result
    }
    this.parsed = this.groupTextTokens(parseLexer(lexer), textGroup)
    return this.parsed
  }
}
