import type { Note } from '@/stores/notes/note'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import React, { useContext } from 'react'
import { css, html } from 'react-strict-dom'
import { ContentContext } from '../Content/Content'
import { LinkNEvent } from '../Links/LinkNEvent'
import { PostActions } from './PostActions/PostActions'
import { PostContent } from './PostContent'
import { PostUserHeader } from './PostUserHeader'

type Props = {
  note: Note
  header?: React.ReactNode
}

export const PostQuote = observer(function PostQuote(props: Props) {
  const { dense, disableLink } = useContext(ContentContext)
  const { header, note } = props
  return (
    <html.div style={styles.root}>
      <html.div style={styles.header}>
        {header || <PostUserHeader dense note={note} disableLink={disableLink} />}
      </html.div>
      {disableLink && <PostContent initialExpanded note={note} disableLink />}
      {!disableLink && (
        <LinkNEvent nevent={note.nevent}>
          <PostContent initialExpanded note={note} disableLink />
        </LinkNEvent>
      )}
      {!dense && (
        <html.div style={styles.actions}>
          <PostActions dense note={note} />
        </html.div>
      )}
    </html.div>
  )
})

const styles = css.create({
  root: {
    paddingBottom: spacing.padding1,
  },
  header: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding1,
  },
  actions: {
    marginTop: spacing.margin1,
    marginLeft: spacing.margin1,
  },
})
