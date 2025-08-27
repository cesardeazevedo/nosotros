import { FollowButton } from '@/components/modules/Follows/FollowButton'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { html, css } from 'react-strict-dom'
import { LinkProfile } from '../Links/LinkProfile'
import { UserContentAbout } from './UserContentAbout'
import { UserHeader } from './UserHeader'

type Props = {
  pubkey: string
}

const maxHeight = 220

export const UserRoot = memo(function UserRoot(props: Props) {
  const { pubkey } = props
  return (
    <LinkProfile pubkey={pubkey}>
      <ContentProvider value={{ disableLink: true }}>
        <Stack sx={[styles.root, styles.action]} align='flex-start' gap={2}>
          <Stack grow horizontal={false} sx={styles.content} gap={4}>
            <UserHeader pubkey={pubkey} />
            <html.div style={styles.about}>
              <UserContentAbout pubkey={pubkey} />
            </html.div>
          </Stack>
          <FollowButton value={pubkey} />
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
      ':hover': 'rgba(125, 125, 125, 0.08)',
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
  about: {
    marginLeft: spacing.margin7,
  },
})
