import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import type { Props as TextProps } from '@/components/ui/Text/Text'
import { Text } from '@/components/ui/Text/Text'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import type User from 'stores/models/user'
import LinkProfile from '../Links/LinkProfile'
import UserPopover from './UserPopover'
import React from 'react'

interface Props extends Omit<TextProps, 'children'> {
  user?: User
  disableLink?: boolean
  disablePopover?: boolean
  children?: React.ReactNode
}

const UserName = observer(function UserName(props: Props) {
  const { user, children, disableLink = false, disablePopover = false, ...rest } = props
  return (
    <Stack>
      {!user && <Skeleton variant='rectangular' sx={styles.loading} />}
      <UserPopover user={user} disabled={disablePopover}>
        <LinkProfile underline user={user} disableLink={disableLink}>
          <Text variant='title' size='md' sx={[styles.text, rest.sx]} {...rest}>
            {user?.displayName}
            {children}
          </Text>
        </LinkProfile>
      </UserPopover>
      {/* {currentUser?.following?.followsPubkey(user?.data.id) && ( */}
      {/*   <Tooltip arrow title='Following'> */}
      {/*     <FollowIndicator icon={<IconUserCheck size={16} strokeWidth='2' />}></FollowIndicator> */}
      {/*   </Tooltip> */}
      {/* )} */}
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
    maxWidth: 260,
  },
})

export default UserName
