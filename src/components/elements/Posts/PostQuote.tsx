import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Paper } from '@/components/ui/Paper/Paper'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNoteState } from '@/hooks/state/useNote'
import { useNevent } from '@/hooks/useEventUtils'
import { duration } from '@/themes/duration.stylex'
import { spacing } from '@/themes/spacing.stylex'
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { LinkNEvent } from '../Links/LinkNEvent'
import { PostActions } from './PostActions/PostActions'
import { PostContent } from './PostContent'
import { PostUserHeader } from './PostUserHeader'

type Props = {
  event: NostrEventDB
  header?: React.ReactNode
}

export const PostQuote = memo(function PostQuote(props: Props) {
  const { event, header } = props
  const note = useNoteState(event)
  const { blured } = useContentContext()
  const nevent = useNevent(event)
  return (
    <LinkNEvent block nevent={nevent}>
      <NoteProvider value={{ event }}>
        <ContentProvider value={{ blured, dense: true, disableLink: true }}>
          <Paper outlined sx={styles.content}>
            <html.div style={styles.root}>
              {header || <PostUserHeader dense sx={styles.header} event={event} />}
              <PostContent initialExpanded note={note} />
              <PostActions note={note} sx={styles.actions} />
            </html.div>
          </Paper>
        </ContentProvider>
      </NoteProvider>
    </LinkNEvent>
  )
})

const styles = css.create({
  root: {
    paddingInline: spacing.padding2,
  },
  header: {
    paddingBlock: spacing.padding1,
  },
  actions: {
    marginTop: spacing.margin1,
    paddingBottom: spacing.padding1,
  },
  content: {
    position: 'relative',
    transition: 'background',
    transitionTimingFunction: 'ease',
    transitionDuration: duration.short1,
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.04)',
    },
  },
})
