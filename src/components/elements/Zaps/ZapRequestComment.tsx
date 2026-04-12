import { useInstalledCustomEmojis } from '@/components/elements/Editor/hooks/useInstalledCustomEmojis'
import { EditorEmojiPopover } from '@/components/elements/Editor/Toolbar/EditorEmojiPopover'
import { createEditorInline } from '@/components/elements/Editor/utils/createEditorInline'
import { getEditorEmojiTags } from '@/components/elements/Editor/utils/getEditorEmojiTags'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconMoodSmile } from '@tabler/icons-react'
import type { Editor as TiptapEditor } from '@tiptap/react'
import { EditorContent as TiptapEditorContent, useEditor } from '@tiptap/react'
import type { NostrEvent } from 'nostr-tools'
import type { Ref } from 'react'
import { memo, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { css } from 'react-strict-dom'

type Value = {
  comment: string
  tags: NostrEvent['tags']
}

export type ZapRequestCommentRef = {
  focus: () => void
  getValue: () => Value
}

type Props = {
  ref?: Ref<ZapRequestCommentRef | null>
}

function removeTrailingNewLines(content: string) {
  return content.replace(/\n+$/, '')
}

function getZapCommentTags(editor: TiptapEditor | null): NostrEvent['tags'] {
  const editorTags = (editor?.storage?.nostr.getEditorTags?.() || []) as NostrEvent['tags']
  const mentionTags = editorTags.filter((tag) => tag[0] === 'p')
  const emojiTags = getEditorEmojiTags(editor)
  const tags: NostrEvent['tags'] = []

  for (const tag of [...mentionTags, ...emojiTags]) {
    if (!tags.some((current) => current.join('\u0000') === tag.join('\u0000'))) {
      tags.push(tag)
    }
  }

  return tags
}

export const ZapRequestComment = memo(function ZapRequestComment(props: Props) {
  const { ref } = props
  const { emojiMap, customEmojis } = useInstalledCustomEmojis()
  const emojiMapRef = useRef(emojiMap)
  emojiMapRef.current = emojiMap

  const [opened, setOpened] = useState(false)

  const resolveEmoji = useCallback((name: string) => {
    const src = emojiMapRef.current.get(name)
    return src ? { name, src } : null
  }, [])

  const getEmojiSuggestions = useCallback((query: string) => {
    const normalized = query.trim().toLowerCase()
    return [...emojiMapRef.current.entries()]
      .filter(([name]) => !normalized || name.toLowerCase().includes(normalized))
      .slice(0, 8)
      .map(([name, src]) => ({ name, src }))
  }, [])

  const editorOptions = useMemo(
    () => createEditorInline('Add a zap comment', resolveEmoji, getEmojiSuggestions),
    [resolveEmoji, getEmojiSuggestions],
  )
  const editor = useEditor(editorOptions, [editorOptions])

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        editor?.chain().focus('end').run()
      },
      getValue: () => ({
        comment: removeTrailingNewLines(editor?.getText({ blockSeparator: '\n' }) || ''),
        tags: getZapCommentTags(editor),
      }),
    }),
    [editor],
  )

  return (
    <Stack horizontal={false} gap={0.5} sx={styles.root}>
      <Stack horizontal align='stretch' sx={styles.field} onClick={() => editor?.chain().focus('end').run()}>
        <TiptapEditorContent editor={editor} {...css.props(styles.editor)} />
        <EditorEmojiPopover
          editor={editor}
          customEmojis={customEmojis}
          placement='top-end'
          opened={opened}
          onClose={() => setOpened(false)}>
          {({ getProps, setRef, opened }) => (
            <Tooltip cursor='arrow' text='Reactions' enterDelay={200}>
              <IconButton
                {...getProps()}
                ref={setRef}
                selected={opened}
                size='sm'
                icon={<IconMoodSmile size={20} strokeWidth='1.6' />}
                onClick={() => setOpened((prev) => !prev)}
              />
            </Tooltip>
          )}
        </EditorEmojiPopover>
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    marginTop: spacing.margin4,
  },
  field: {
    alignItems: 'stretch',
    width: '100%',
    minHeight: 96,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: palette.outlineVariant,
    borderRadius: shape.lg,
    paddingInline: spacing.padding1,
    paddingBlock: spacing['padding0.5'],
    gap: spacing['padding0.5'],
    cursor: 'text',
    overflow: 'hidden',
  },
  editor: {
    flex: '1 1 auto',
    fontSize: 16,
    padding: spacing.padding1,
    minWidth: 0,
    minHeight: 84,
    height: '100%',
    width: '100%',
    textAlign: 'left',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
  },
})
