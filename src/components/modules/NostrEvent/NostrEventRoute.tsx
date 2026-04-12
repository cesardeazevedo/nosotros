import { isDeletedEventAtomFamily } from '@/atoms/deletion.atoms'
import { EditorProvider } from '@/components/elements/Editor/EditorProvider'
import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { HeaderBase } from '@/components/elements/Layouts/HeaderBase'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { NavigationHeader } from '@/components/elements/Navigation/NavigationHeader'
import { PostDeleted } from '@/components/elements/Posts/PostDeleted'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { PostUserHeader } from '@/components/elements/Posts/PostUserHeader'
import { Replies } from '@/components/elements/Replies/Replies'
import { ThreadsMinimap } from '@/components/elements/Threads/ThreadsMinimap'
import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventFromNIP19 } from '@/hooks/query/useQueryBase'
import { useNoteState } from '@/hooks/state/useNote'
import { useMobile } from '@/hooks/useMobile'
import { useGoBack } from '@/hooks/useNavigations'
import { useNostrNavigationScope } from '@/hooks/useNostrMaskedLinkProps'
import { useResetScroll } from '@/hooks/useResetScroll'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { nip19ToId } from '@/utils/nip19'
import { IconChevronLeft, IconX } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

export type Props = {
  nip19: string
}

const NostrEventHeader = memo(function NostrEventHeader(props: { event: NostrEventDB }) {
  const { event } = props
  const goBack = useGoBack()
  const navigate = useNavigate()
  const scope = useNostrNavigationScope()
  const isColumn = scope === 'column'

  return (
    <HeaderBase
      leading={
        <Stack gap={1}>
          <IconButton onClick={goBack} icon={<IconChevronLeft color='currentColor' />} />
          <PostUserHeader event={event} dense renderNIP05={false} userAvatarProps={{ size: 'sm' }} />
        </Stack>
      }>
      {isColumn ? (
        <IconButton
          aria-label='Close column'
          icon={<IconX color='currentColor' />}
          onClick={() =>
            navigate({
              to: '.',
              search: ({ column, column_size, ...rest }) => rest,
            })
          }
        />
      ) : null}
    </HeaderBase>
  )
})

const NostrEventReplies = memo(function NostrEventReplies(props: { event: NostrEventDB }) {
  const { event } = props
  const note = useNoteState(event, { repliesOpen: true, forceSync: true, contentOpen: true })

  if (!event.metadata?.isRoot) {
    return null
  }

  return (
    <>
      <Divider />
      <EditorProvider sx={styles.editor} parent={event} renderBubble initialOpen />
      <Replies note={note} />
    </>
  )
})

const NostrEventBody = memo(function NostrEventBody(props: { event: NostrEventDB }) {
  const { event } = props

  return (
    <PaperContainer sx={styles.paper}>
      <Stack horizontal={false} sx={styles.main}>
        <NostrEventRoot event={event} />
        <NostrEventReplies event={event} />
      </Stack>
    </PaperContainer>
  )
})

export const NostrEventRoute = memo(function NostrEventRoute(props: Props) {
  const { nip19 } = props
  const isMobile = useMobile()
  const note = useEventFromNIP19(nip19, undefined, false)
  const id = nip19ToId(nip19)
  const deleted = useAtomValue(isDeletedEventAtomFamily(id))
  useResetScroll()

  return (
    <Stack horizontal={false} sx={styles.route}>
      <Stack horizontal justify='space-between' sx={styles.header}>
        {note.data ? <NostrEventHeader event={note.data} /> : <NavigationHeader />}
      </Stack>
      <html.section role='region' style={styles.scrollBody}>
        <CenteredContainer margin>
          <html.div style={styles.contentWrap}>
            <html.div style={styles.contentMain}>
              {deleted && <PostDeleted />}
              {!deleted && !note.data && <PostLoading rows={1} />}
              {!deleted && note.data && <NostrEventBody event={note.data} />}
            </html.div>
            {!deleted && note.data && !isMobile && (
              <html.div style={styles.minimapRail}>
                <html.div style={styles.minimapSticky}>
                  <ThreadsMinimap event={note.data} />
                </html.div>
              </html.div>
            )}
          </html.div>
        </CenteredContainer>
      </html.section>
    </Stack>
  )
})

const styles = css.create({
  route: {
    width: '100%',
    height: '100%',
    minHeight: 0,
  },
  header: {
    flexShrink: 0,
    width: '100%',
    borderBottom: '1px solid',
    borderBottomColor: palette.outlineVariant,
    zIndex: 10,
  },
  scrollBody: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  contentWrap: {
    position: 'relative',
    width: '100%',
  },
  contentMain: {
    position: 'relative',
    zIndex: 1,
  },
  minimapRail: {
    position: 'absolute',
    left: 'calc(100% + 12px)',
    top: 0,
    bottom: 0,
    width: 200,
    zIndex: 2,
    '@media (max-width: 1080px)': {
      display: 'none',
    },
  },
  minimapSticky: {
    position: 'sticky',
    top: 76,
  },
  paper: {
    overflow: 'hidden',
  },
  editor: {
    padding: spacing.padding2,
    paddingTop: spacing.padding2,
    paddingBottom: 0,
  },
})
