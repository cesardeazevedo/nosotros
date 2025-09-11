import { FollowButton } from '@/components/modules/Follows/FollowButton'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { LinkProfile } from '../Links/LinkProfile'
import { UserContentAbout } from './UserContentAbout'
import { UserHeader } from './UserHeader'

type Props = {
  pubkey: string
}

export const UserRoot = memo(function UserRoot(props: Props) {
  const { pubkey } = props
  return (
    <LinkProfile pubkey={pubkey}>
      <ContentProvider value={{ disableLink: true }}>
        <Stack sx={[styles.root, styles.action]} align='flex-start' gap={2}>
          <Stack grow horizontal={false} gap={4}>
            <UserHeader pubkey={pubkey} />
            <UserContentAbout pubkey={pubkey} />
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
    borderBottomWidth: 1,
    borderBottomColor: palette.outlineVariant,
  },
  action: {
    cursor: 'pointer',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.08)',
    },
  },
  about: {
    marginLeft: spacing.margin7,
  },
})
