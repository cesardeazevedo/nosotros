import { UserChip } from '@/components/elements/User/UserChip'
import type { FeedState } from '@/hooks/state/useFeed'
import { spacing } from '@/themes/spacing.stylex'
import { useNavigate } from '@tanstack/react-router'
import { css, html } from 'react-strict-dom'

type Props = {
  feed: FeedState
}

export const FeedSelectedAuthorChip = (props: Props) => {
  const { feed } = props
  const navigate = useNavigate()
  const pubkey = feed.selectedAuthor

  if (!pubkey) {
    return null
  }

  return (
    <html.div style={styles.root}>
      <UserChip
        pubkey={pubkey}
        onDelete={() =>
          navigate({
            to: '.',
            replace: true,
            search: (prev) => ({
              ...prev,
              view_author: undefined,
            }),
          })
        }
      />
    </html.div>
  )
}

const styles = css.create({
  root: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding2,
  },
})
