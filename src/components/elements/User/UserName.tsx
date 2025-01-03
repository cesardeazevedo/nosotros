import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import type { Props as TextProps } from '@/components/ui/Text/Text'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useCurrentUser } from '@/hooks/useRootStore'
import type { User } from '@/stores/users/user'
import { userStore } from '@/stores/users/users.store'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconUserCheck } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { css, html } from 'react-strict-dom'
import { LinkProfile } from '../Links/LinkProfile'
import { UserPopover } from './UserPopover'

interface Props extends Omit<TextProps, 'children'> {
  user?: User
  pubkey?: string
  disableLink?: boolean
  disablePopover?: boolean
  children?: React.ReactNode
}

export const UserName = observer(function UserName(props: Props) {
  const { pubkey, children, disableLink = false, disablePopover = false, size = 'lg', ...rest } = props
  const user = userStore.get(pubkey)
  const currentUser = useCurrentUser()
  return (
    <Stack gap={0.5} sx={props.sx}>
      {!user && <Skeleton variant='rectangular' sx={styles.loading} />}
      <UserPopover user={user} disabled={disablePopover}>
        <LinkProfile underline user={user} disableLink={disableLink}>
          <Text variant='body' sx={[styles.text, rest.sx]} size={size} {...rest} element={html.div}>
            {user?.displayName}
            {children}
          </Text>
        </LinkProfile>
      </UserPopover>
      {currentUser?.following?.followsPubkey(user?.pubkey) && (
        <Tooltip cursor='arrow' text='Following'>
          <html.div style={styles.followingIndicator}>
            <IconUserCheck size={14} strokeWidth='2.0' />
          </html.div>
        </Tooltip>
      )}
    </Stack>
  )
})

const styles = css.create({
  container: {},
  loading: {
    marginLeft: 0,
    alignSelf: 'center',
    width: 100,
    height: 14,
    borderRadius: 6,
  },
  text: {
    fontWeight: 600,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    maxWidth: 280,
    //lineHeight: '16px',
  },
  followingIndicator: {
    backgroundColor: palette.surfaceContainerHigh,
    opacity: 0.77,
    paddingBlock: 2,
    paddingInline: spacing['padding0.5'],
    borderRadius: shape.sm,
  },
})
