import { NoteContext } from '@/components/providers/NoteProvider'
import { Button } from '@/components/ui/Button/Button'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import type { Note } from '@/stores/notes/note'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconDotsVertical } from '@tabler/icons-react'
import { useMatch } from '@tanstack/react-router'
import { Observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { Editor } from '../Editor/Editor'
import { WaveDivider } from '../Layouts/WaveDivider'
import { LinkNEvent } from '../Links/LinkNEvent'
import { UserAvatar } from '../User/UserAvatar'
import { PostActions } from './PostActions/PostActions'
import { PostContent } from './PostContent'
import { PostHeader } from './PostHeader'
import { PostReplies } from './PostReplies/PostReplies'
import { PostReplyContent } from './PostReplies/PostReplyContent'

type Props = {
  note: Note
  renderParents?: boolean
  renderReplies?: boolean
  renderEditor?: boolean
}

export const PostThread = function PostThread(props: Props) {
  const { note, renderEditor = true, renderParents = true, renderReplies = true } = props
  const context = useMatch({ from: '/$nostr', shouldThrow: false })?.context
  const ref = useRef<HTMLDivElement>(null)
  const isCurrentNote = context?.decoded?.type === 'nevent' ? context?.decoded.data.id === note.id : false

  useEffect(() => {
    if (isCurrentNote && ref.current) {
      // This needs to be better
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
      }, 100)
    }
  }, [isCurrentNote, note.id])

  if (!note.metadata.isRoot) {
    // replies parents
    return (
      <Observer>
        {() => (
          <>
            {renderParents && (
              <>
                {note.parent ? (
                  <PostThread renderEditor={renderEditor} note={note.parent} />
                ) : (
                  // Some events are missing in the middle
                  <>
                    {note.root && <PostThread note={note.root} />}
                    <Stack sx={styles.fullthread} gap={2}>
                      <IconDotsVertical />
                      <LinkNEvent nevent={note.root?.nevent || note.nevent}>
                        <Button variant='filledTonal'>See full thread</Button>
                      </LinkNEvent>
                    </Stack>
                  </>
                )}
              </>
            )}
            <html.div style={styles.reply} ref={ref}>
              {isCurrentNote && <html.div style={styles.current}></html.div>}
              <Stack align='flex-start' gap={1} sx={styles.content}>
                <html.div style={styles.thread} />
                <UserAvatar pubkey={note.event.pubkey} />
                <Stack gap={1}>
                  <NoteContext.Provider value={{ dense: true }}>
                    <Stack horizontal={false}>
                      <PostReplyContent note={note} />
                      <html.div style={styles.root$actions}>
                        <PostActions renderOptions note={note} onReplyClick={() => note.toggleReplies()} />
                      </html.div>
                    </Stack>
                  </NoteContext.Provider>
                </Stack>
              </Stack>
            </html.div>
            {renderEditor && isCurrentNote && note.repliesOpen && (
              <Stack sx={styles.divider}>
                <IconDotsVertical />
                <WaveDivider />
              </Stack>
            )}
            {renderEditor && (
              <html.div style={styles.editor}>
                <Expandable expanded={note.repliesOpen || false} trigger={() => <></>}>
                  <Editor renderBubble initialOpen store={note.editor} />
                </Expandable>
              </html.div>
            )}
            {renderReplies && isCurrentNote && note.repliesOpen && (
              <PostReplies note={note} onLoadMoreClick={() => note.toggleReplies()} />
            )}
          </>
        )}
      </Observer>
    )
  }

  // root post
  return (
    <Observer>
      {() => (
        <Stack gap={2} align='flex-start' sx={styles.root}>
          <html.div style={styles.thread} />
          <Stack horizontal={false} grow>
            <PostHeader note={note} renderOptions={false} />
            <Stack horizontal={false} sx={styles.rootWrapper}>
              <NoteContext.Provider value={{ dense: true }}>
                <PostContent note={note} />
                <PostActions
                  note={note}
                  renderOptions
                  onReplyClick={() => note.toggleReplies()}
                  sx={styles.root$actions}
                />
              </NoteContext.Provider>
            </Stack>
            {renderEditor && (
              <html.div style={styles.editor}>
                <Expandable expanded={note.repliesOpen || false} trigger={() => <></>}>
                  <Editor renderBubble initialOpen store={note.editor} />
                </Expandable>
              </html.div>
            )}
          </Stack>
        </Stack>
      )}
    </Observer>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
  },
  root$actions: {
    paddingTop: spacing.padding1,
  },
  reply: {
    position: 'relative',
    paddingInline: spacing.padding2,
    scrollMargin: 64,
  },
  content: {
    paddingBlock: spacing.padding1,
  },
  rootWrapper: {
    position: 'relative',
    paddingTop: 0,
    paddingLeft: spacing.padding8,
    paddingRight: spacing.padding4,
    paddingBottom: spacing.padding2,
  },
  current: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    //height: '100%',
    backgroundColor: palette.tertiary,
  },
  thread: {
    position: 'absolute',
    top: 60,
    left: 28,
    width: 12,
    bottom: 0,
    ':before': {
      content: '',
      position: 'relative',
      top: 0,
      left: 6,
      width: 3,
      borderRadius: 4,
      height: '100%',
      pointerEvents: 'none',
      display: 'inline-block',
      backgroundColor: palette.outlineVariant,
    },
  },
  divider: {
    paddingTop: spacing.padding2,
    paddingBottom: spacing.padding1,
    paddingLeft: spacing.padding3,
    color: palette.outlineVariant,
  },
  fullthread: {
    color: palette.outline,
    paddingTop: spacing.padding1,
    paddingBottom: spacing.padding1,
    paddingInline: spacing.padding3,
  },
  editor: {
    position: 'relative',
    paddingLeft: spacing.padding1,
    paddingRight: spacing.padding4,
  },
})
