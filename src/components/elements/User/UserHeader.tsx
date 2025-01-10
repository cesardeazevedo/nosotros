import type { Props as StackProps } from '@/components/ui/Stack/Stack'
import { Stack } from '@/components/ui/Stack/Stack'
import type { Props as TextProps } from '@/components/ui/Text/Text'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { css } from 'react-strict-dom'
import type { Props as UserAvatarProps } from './UserAvatar'
import { UserAvatar } from './UserAvatar'
import { UserName } from './UserName'
import { UserNIP05 } from './UserNIP05'

export type Props = StackProps & {
  pubkey: string
  dense?: boolean
  children?: React.ReactNode
  userAvatarProps?: Omit<UserAvatarProps, 'pubkey'>
  size?: TextProps['size']
  renderNIP05?: boolean
  disableLink?: boolean
}

export const UserHeader = observer(function UserHeader(props: Props) {
  const { pubkey, dense, disableLink, children, size, userAvatarProps, renderNIP05 = true, ...rest } = props
  return (
    <Stack horizontal gap={2} align='center' sx={styles.root} {...rest}>
      <UserAvatar pubkey={pubkey} size={dense ? 'sm' : 'md'} disableLink={disableLink} {...userAvatarProps} />
      <Stack horizontal={false} gap={0}>
        <Stack horizontal gap={1} align='center' justify='flex-start'>
          <UserName pubkey={pubkey} disableLink={disableLink} size={size} />
          {children}
        </Stack>
        {renderNIP05 && <UserNIP05 pubkey={pubkey} />}
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    height: 40,
  },
})
