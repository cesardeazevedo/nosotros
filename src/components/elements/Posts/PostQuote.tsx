import type { Note } from '@/stores/notes/note'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { css, html } from 'react-strict-dom'
import { PostActions } from './PostActions/PostActions'
import { PostContent } from './PostContent'
import { PostUserHeader } from './PostUserHeader'

type Props = {
  note: Note
  header?: React.ReactNode
}

export const PostQuote = observer(function PostQuote(props: Props) {
  const { header, note } = props
  return (
    <html.div style={styles.root}>
      <html.div style={styles.header}>{header || <PostUserHeader dense note={note} disableLink />}</html.div>
      <PostContent initialExpanded note={note} />
      <html.div style={styles.actions}>
        <PostActions note={note} />
      </html.div>
    </html.div>
  )
})

const styles = css.create({
  root: {
    paddingBottom: spacing.padding1,
  },
  header: {
    paddingBlock: spacing.padding1,
  },
  actions: {
    marginTop: spacing.margin1,
  },
})
