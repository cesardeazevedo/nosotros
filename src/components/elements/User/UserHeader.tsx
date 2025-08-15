import type { Props as StackProps } from '@/components/ui/Stack/Stack'
import { Stack } from '@/components/ui/Stack/Stack'
import type { Props as TextProps } from '@/components/ui/Text/Text'
import React, { memo } from 'react'
import { css } from 'react-strict-dom'
import type { Props as UserAvatarProps } from './UserAvatar'
import { UserAvatar } from './UserAvatar'
import { UserName } from './UserName'
import { UserNIP05 } from './UserNIP05'

export type Props = StackProps & {
  pubkey: string
  dense?: boolean
  children?: React.ReactNode
  footer?: React.ReactNode
  userAvatarProps?: Omit<UserAvatarProps, 'pubkey'>
  size?: TextProps['size']
  renderAvatar?: boolean
  renderNIP05?: boolean
}

export const UserHeader = memo(function UserHeader(props: Props) {
  const {
    renderAvatar = true,
    pubkey,
    dense,
    children,
    footer,
    size,
    userAvatarProps,
    renderNIP05 = true,
    ...rest
  } = props
  return (
    <Stack horizontal gap={2} align='center' sx={styles.root} {...rest}>
      {renderAvatar && <UserAvatar pubkey={pubkey} size={dense ? 'sm' : 'md'} {...userAvatarProps} />}
      <Stack horizontal={false}>
        <UserName pubkey={pubkey} size={size}>
          {children}
        </UserName>
        {renderNIP05 && <UserNIP05 pubkey={pubkey} />}
        {footer}
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    height: 40,
  },
})
