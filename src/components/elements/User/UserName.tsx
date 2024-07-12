import { Chip, Skeleton, Typography, styled, type TypographyProps } from '@mui/material'
import { IconUserCheck } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import type User from 'stores/models/user'
import { Row } from '../Layouts/Flex'
import Tooltip from '../Layouts/Tooltip'
import LinkProfile from '../Links/LinkProfile'
import UserPopover from './UserPopover'
import { authStore } from 'stores/ui/auth.store'

interface Props extends TypographyProps {
  user?: User
  disableLink?: boolean
  disablePopover?: boolean
}

const Container = styled(Typography)({
  fontWeight: 600,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
})

const FollowIndicator = styled(Chip)({
  marginLeft: 4,
  paddingTop: 1,
  display: 'inline-block',
  width: 26,
  height: 18,
  textAlign: 'center',
})

const UserName = observer(function UserName(props: Props) {
  const { user, children, disableLink = false, disablePopover = false, ...rest } = props
  const { currentUser } = authStore
  return (
    <Row>
      {!user && (
        <Skeleton variant='rectangular' style={{ alignSelf: 'center', width: 100, height: 14, borderRadius: 6 }} />
      )}
      <UserPopover user={user} disabled={disablePopover}>
        <LinkProfile user={user} disabled={disableLink}>
          <Container variant='subtitle1' {...rest}>
            {user?.displayName}
            {children}
          </Container>
        </LinkProfile>
      </UserPopover>
      {currentUser?.following?.followsPubkey(user?.data.id) && (
        <Tooltip arrow title='Following'>
          <FollowIndicator icon={<IconUserCheck size={16} strokeWidth='2' />}></FollowIndicator>
        </Tooltip>
      )}
    </Row>
  )
})

export default UserName
