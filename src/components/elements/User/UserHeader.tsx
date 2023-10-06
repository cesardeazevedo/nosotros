import { Box, Link, Skeleton, Typography } from '@mui/material'
import { IconDiscountCheckFilled } from '@tabler/icons-react'
import { Row } from 'components/elements/Layouts/Flex'
import { DateTime } from 'luxon'
import { observer } from 'mobx-react-lite'
import { useStore } from 'stores'

import Tooltip from 'components/elements/Layouts/Tooltip'

import { Event } from 'nostr-tools'
import { useMemo } from 'react'
import LinkProfile from '../Navigation/LinkProfile'
import UserAvatar from './UserAvatar'
import UserName from './UserName'
import UserPopover from './UserPopover'

type Props = {
  event: Event
  dense?: boolean
  alignCenter?: boolean
}

const UserHeader = observer(function UserHeader(props: Props) {
  const { event, dense, alignCenter = true } = props
  const store = useStore()
  const user = store.users.getUserById(event.pubkey)
  const shortDate = useMemo(
    () => DateTime.fromSeconds(event.created_at).toRelative({ style: 'narrow' })?.replace('ago', ''),
    [event],
  )
  const fullDate = useMemo(() => DateTime.fromSeconds(event.created_at).toLocaleString(DateTime.DATETIME_FULL), [event])

  return (
    <Row component='span' sx={{ alignItems: alignCenter ? 'center' : 'flex-start', height: !alignCenter ? 42 : 46 }}>
      <UserPopover user={user}>
        <LinkProfile user={user}>
          <UserAvatar user={user} dense={dense} />
        </LinkProfile>
      </UserPopover>
      <Row>
        {!user && (
          <Skeleton
            variant='rectangular'
            style={{ alignSelf: 'center', width: 100, height: 14, borderRadius: 6, marginLeft: 14 }}
          />
        )}
        {user && (
          <UserPopover user={user}>
            <LinkProfile user={user}>
              <UserName user={user} sx={{ maxWidth: 260, ml: 2 }} />
            </LinkProfile>
          </UserPopover>
        )}
        {user?.nip05 && (
          <Tooltip arrow title={user.nip05}>
            <IconDiscountCheckFilled size={18} style={{ verticalAlign: 'text-bottom', marginLeft: 4 }} />
          </Tooltip>
        )}
        <Box sx={{ mx: 1, fontWeight: 600, color: 'text.secondary' }}>·</Box>
        <Link>
          <Tooltip arrow title={fullDate}>
            <Typography variant='caption' color='textSecondary' sx={{ whiteSpace: 'nowrap' }}>
              {shortDate}
            </Typography>
          </Tooltip>
        </Link>
      </Row>
    </Row>
  )
})

export default UserHeader
