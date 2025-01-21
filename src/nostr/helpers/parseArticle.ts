import { Kind } from '@/constants/kinds'
import type { MetadataDB } from '@/db/types'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { NostrExtension } from 'nostr-editor'
import type { NostrEvent } from 'nostr-tools'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import type { ContentMetadata } from './parseContent'
import { parseContent } from './parseContent'
import type { ParsedTags } from './parseTags'
import { parseTags } from './parseTags'

type Article = {
  kind: Kind.Article
  isRoot: true
  tags: ParsedTags
}

type ArticleMetadata = MetadataDB & ContentMetadata & Article

const editor = new Editor({
  extensions: [
    StarterKit,
    MarkdownExtension.configure({ breaks: true }),
    NostrExtension.configure({ nsecReject: false, link: { autolink: true } }),
  ],
})

export function parseArticle(event: NostrEvent): ArticleMetadata {
  const tags = parseTags(event.tags)
  const content = parseContent(editor, event, tags)
  return {
    id: event.id,
    kind: Kind.Article,
    isRoot: true,
    tags,
    ...content,
  }
}
