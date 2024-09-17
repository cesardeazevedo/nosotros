import { Paper } from '@/components/ui/Paper/Paper'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import LinkNEvent from 'components/elements/Links/LinkNEvent'
import PostActions from 'components/elements/Posts/PostActions/PostActions'
import PostContent from 'components/elements/Posts/PostContent'
import UserHeader from 'components/elements/User/UserHeader'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { css, html } from 'react-strict-dom'
import { noteStore } from 'stores/nostr/notes.store'
import { ContentContext } from '../Content'

type Props = {
  noteId: string
  author: string | undefined
}

export const NEvent = observer(function PostNote(props: Props) {
  const { dense, disableLink } = useContext(ContentContext)
  const note = noteStore.get(props.noteId)
  return (
    <html.div style={[styles.root, dense && styles.root$dense]}>
      {!note && (
        <Skeleton variant='rectangular' animation='wave' sx={[styles.loading, dense && styles.loading$dense]} />
      )}
      {note && (
        <Paper outlined sx={styles.content}>
          <html.div style={styles.header}>
            <UserHeader dense note={note} disableLink={disableLink} />
          </html.div>
          {disableLink && <PostContent initialExpanded note={note} disableLink />}
          {!disableLink && (
            <LinkNEvent note={note} sx={styles.link}>
              <PostContent initialExpanded note={note} disableLink />
            </LinkNEvent>
          )}
          {!dense && (
            <html.div style={styles.actions}>
              <PostActions dense note={note} />
            </html.div>
          )}
        </Paper>
      )}
    </html.div>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    marginTop: spacing.margin1,
    paddingInline: spacing.padding2,
  },
  root$dense: {
    paddingInline: 0,
    maxWidth: 'calc(100vw - 90px)',
  },
  header: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding1,
  },
  content: {
    position: 'relative',
    paddingBottom: spacing.padding1,
    background: 'transparent',
  },
  content$dense: {
    marginInline: 0,
  },
  actions: {
    marginTop: spacing.margin1,
    marginLeft: spacing.margin1,
  },
  link: {
    cursor: 'pointer',
    fontWeight: 'normal',
  },
  loading: {
    paddingInline: spacing.padding2,
    width: '100%',
    minWidth: 340,
    height: 80,
    borderRadius: shape.lg,
  },
  loading$dense: {
    paddingInline: 0,
  },
})
