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
  const { blured, disableLink } = useContentContext()
  const nevent = useNevent(event)
  const content = (
    <NoteProvider value={{ event }}>
      <ContentProvider value={{ blured, dense: true, disableLink: true }}>
        <Paper outlined sx={styles.root}>
          <html.div style={styles.wrapper}>
            {header || <PostUserHeader dense sx={styles.header} event={event} />}
            <PostContent initialExpanded note={note} />
            <PostActions note={note} sx={styles.actions} />
          </html.div>
        </Paper>
      </ContentProvider>
    </NoteProvider>
  )
  if (disableLink) {
    return content
  }
  return <LinkNEvent nevent={nevent}>{content}</LinkNEvent>
})

const styles = css.create({
  root: {
    position: 'relative',
    transition: 'background',
    transitionTimingFunction: 'ease',
    transitionDuration: duration.short1,
    marginBottom: spacing.padding1,
    backgroundColor: {
      default: 'transparent',
      ':hover:not(:has(button:hover, img:hover))': 'rgba(125, 125, 125, 0.04)',
    },
  },
  wrapper: {
    paddingInline: spacing.padding2,
  },
  header: {
    paddingBlock: spacing.padding1,
  },
  actions: {
    marginTop: spacing.margin1,
    paddingBottom: spacing.padding1,
  },
})
