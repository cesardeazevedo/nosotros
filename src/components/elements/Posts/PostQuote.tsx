import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { NoteProvider } from '@/components/providers/NoteProvider'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNoteState } from '@/hooks/state/useNote'
import { useNevent } from '@/hooks/useEventUtils'
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
    <LinkNEvent nevent={nevent}>
      <NoteProvider value={{ event, note }}>
        <ContentProvider value={{ blured, dense: true, disableLink: true }}>
          <html.div style={styles.root}>
            {header || <PostUserHeader dense sx={styles.header} event={event} />}
            <PostContent initialExpanded />
            <PostActions sx={styles.actions} />
          </html.div>
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
})
