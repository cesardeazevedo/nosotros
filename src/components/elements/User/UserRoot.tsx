import { ContentProvider } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventMetadata } from '@/nostr/types'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { LinkProfile } from '../Links/LinkProfile'
import { UserContentAbout } from './UserContentAbout'
import { UserFollowButton } from './UserFollowButton'
import { UserHeader } from './UserHeader'

type Props = {
  event: NostrEventMetadata
}

const maxHeight = 220

export const UserRoot = observer(function UserRoot(props: Props) {
  const { event } = props
  const { pubkey } = event
  return (
    <LinkProfile pubkey={pubkey}>
      <ContentProvider value={{ disableLink: true }}>
        <Stack sx={[styles.root, styles.action]} align='flex-start' gap={2}>
          <Stack grow horizontal={false} sx={styles.content} gap={2}>
            <UserHeader pubkey={pubkey} />
            <br />
            <UserContentAbout pubkey={pubkey} />
          </Stack>
          <UserFollowButton pubkey={pubkey} />
        </Stack>
      </ContentProvider>
    </LinkProfile>
  )
})

const styles = css.create({
  root: {
    padding: spacing.padding2,
  },
  action: {
    cursor: 'pointer',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.03)',
    },
  },
  content: {
    maxHeight,
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': '4',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
})
