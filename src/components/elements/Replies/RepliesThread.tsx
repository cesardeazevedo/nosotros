import { ContentProvider } from '@/components/providers/ContentProvider'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Button } from '@/components/ui/Button/Button'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import { useNoteStore } from '@/hooks/useNoteStore'
import type { NostrEventMetadata } from '@/nostr/types'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconDotsVertical } from '@tabler/icons-react'
import { useMatch } from '@tanstack/react-router'
import { Observer } from 'mobx-react-lite'
import { useContext, useEffect, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { DeckContext } from '../../modules/Deck/DeckContext'
import { Editor } from '../Editor/Editor'
import { WaveDivider } from '../Layouts/WaveDivider'
import { LinkNEvent } from '../Links/LinkNEvent'
import { PostActions } from '../Posts/PostActions/PostActions'
import { PostContent } from '../Posts/PostContent'
import { PostHeader } from '../Posts/PostHeader'
import { UserAvatar } from '../User/UserAvatar'
import { Replies } from './Replies'
import { ReplyContent } from './ReplyContent'
import type { NostrModule } from '@/stores/modules/nostr.module'

type Props = {
  event: NostrEventMetadata
  open?: boolean
  renderParents?: boolean
  renderReplies?: boolean
  renderEditor?: boolean
}

export const RepliesThread = function RepliesThread(props: Props) {
  const { event, renderEditor = true, renderParents = true, renderReplies = true, open } = props
  const note = useNoteStore(event, open)
  const context = useMatch({ from: '/$nostr', shouldThrow: false })?.context
  const module = useContext(DeckContext).module as NostrModule
  const ref = useRef<HTMLDivElement>(null)
  const isCurrentNote =
    context?.decoded?.type === 'nevent' ? context?.decoded.data.id === note.id : module.filter.ids?.[0] === note.id

  useEffect(() => {
    if (isCurrentNote && ref.current) {
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
      }, 100)
    }
  }, [isCurrentNote, note.id])

  if (!note.metadata.isRoot) {
    // replies parents
    return (
      <NoteProvider value={{ note }}>
        <Observer>
          {() => (
            <>
              {renderParents && (
                <>
                  {note.parent ? (
                    <RepliesThread renderEditor={renderEditor} event={note.parent.event} />
                  ) : (
                    // Some events are missing in the middle
                    <>
                      {note.root && <RepliesThread event={note.root.event} />}
                      <Stack sx={styles.fullthread} gap={2}>
                        <IconDotsVertical />
                        <LinkNEvent nevent={note.root?.nevent || note.event.nevent}>
                          <Button variant='filledTonal'>See full thread</Button>
                        </LinkNEvent>
                      </Stack>
                    </>
                  )}
                </>
              )}
              <ContentProvider value={{ dense: true }}>
                <html.div style={styles.reply} ref={ref}>
                  {isCurrentNote && <html.div style={styles.current}></html.div>}
                  <Stack align='flex-start' gap={1} sx={styles.content}>
                    <html.div style={styles.thread} />
                    <UserAvatar pubkey={note.event.pubkey} />
                    <Stack gap={1}>
                      <Stack horizontal={false}>
                        <ReplyContent />
                        <html.div style={styles.root$actions}>
                          <PostActions renderOptions onReplyClick={() => note.toggleReplies()} />
                        </html.div>
                      </Stack>
                    </Stack>
                  </Stack>
                </html.div>
                {renderEditor && isCurrentNote && note.repliesOpen && (
                  <Stack sx={styles.divider} gap={2}>
                    <html.div>
                      <IconDotsVertical strokeWidth='1.8' size={24} />
                    </html.div>
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
              </ContentProvider>
              {renderReplies && isCurrentNote && note.repliesOpen && (
                <Replies
                  onLoadMoreClick={() => {
                    if (note.repliesOpen) {
                      note.paginate()
                    } else {
                      note.toggleReplies()
                    }
                  }}
                />
              )}
            </>
          )}
        </Observer>
      </NoteProvider>
    )
  }

  // root post
  return (
    <NoteProvider value={{ note }}>
      <ContentProvider value={{ dense: true }}>
        <Observer>
          {() => (
            <Stack gap={2} align='flex-start' sx={styles.root}>
              <html.div style={styles.thread} />
              <Stack horizontal={false} grow>
                <PostHeader renderOptions={false} />
                <Stack horizontal={false} sx={styles.rootWrapper}>
                  <PostContent />
                  <PostActions renderOptions onReplyClick={() => note.toggleReplies()} sx={styles.root$actions} />
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
      </ContentProvider>
    </NoteProvider>
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
    paddingLeft: 24,
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
    paddingRight: spacing.padding2,
  },
})
