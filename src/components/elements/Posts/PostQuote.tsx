import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { useNoteStore } from '@/hooks/useNoteStore'
import type { NostrEventMetadata } from '@/nostr/types'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { css } from 'react-strict-dom'
import { LinkNEvent } from '../Links/LinkNEvent'
import { PostActions } from './PostActions/PostActions'
import { PostContent } from './PostContent'
import { PostUserHeader } from './PostUserHeader'

type Props = {
  event: NostrEventMetadata
  header?: React.ReactNode
}

export const PostQuote = observer(function PostQuote(props: Props) {
  const { event, header } = props
  const note = useNoteStore(event)
  const { blured } = useContentContext()
  return (
    <LinkNEvent nevent={note.event.nevent}>
      <NoteProvider value={{ note }}>
        <ContentProvider value={{ blured, dense: true, disableLink: true }}>
          {header || <PostUserHeader sx={styles.header} dense />}
          <PostContent initialExpanded />
          <PostActions sx={styles.actions} />
        </ContentProvider>
      </NoteProvider>
    </LinkNEvent>
  )
})

const styles = css.create({
  header: {
    paddingBlock: spacing.padding1,
  },
  actions: {
    marginTop: spacing.margin1,
    paddingBottom: spacing.padding1,
  },
})
