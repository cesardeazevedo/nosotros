import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { css, html } from 'react-strict-dom'
import { PostCountdown } from './PostCountdown'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useCurrentPubkey } from '@/hooks/useAuth'

type Props = {
  event: NostrEventDB
  children: React.ReactNode
}

export const PostFeedItemContainer = (props: Props) => {
  const { event } = props
  const pubkey = useCurrentPubkey()
  return (
    <html.article style={styles.root}>
      {event.pubkey === pubkey && <PostCountdown id={event.id} />}
      {props.children}
    </html.article>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
    marginBlock: spacing.margin2,
    // border: '1px solid blue'
    // borderBottom: '1px solid',
    // borderBottomColor: palette.outlineVariant,
    '::before': {
      content: '" "',
      borderBottom: '1px solid',
      borderBottomColor: palette.outlineVariant,
      position: 'absolute',
      bottom: -8,
      left: 0,
      right: 0,
    },
  },
})
