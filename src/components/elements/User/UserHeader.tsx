import { Box, Typography } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'
import { DateTime } from 'luxon'
import { observer } from 'mobx-react-lite'

import Tooltip from 'components/elements/Layouts/Tooltip'

import { useMemo } from 'react'
import type { Note } from 'stores/modules/note.store'
import LinkNEvent from '../Links/LinkNEvent'
import UserAvatar from './UserAvatar'
import UserName from './UserName'

type Props = {
  note: Note
  dense?: boolean
  alignCenter?: boolean
}

export const UserHeaderDate = function UserHeaderDate(props: { note: Note }) {
  const { note } = props
  const { event } = note
  const shortDate = useMemo(
    () => DateTime.fromSeconds(event.created_at).toRelative({ style: 'narrow' })?.replace('ago', ''),
    [event],
  )
  const fullDate = useMemo(() => DateTime.fromSeconds(event.created_at).toLocaleString(DateTime.DATETIME_FULL), [event])
  return (
    <>
      <Box sx={{ mx: 1, fontWeight: 600, color: 'text.secondary' }}>·</Box>
      <LinkNEvent note={note}>
        <Tooltip arrow title={fullDate}>
          <Typography variant='caption' color='textSecondary' sx={{ whiteSpace: 'nowrap' }}>
            {shortDate}
          </Typography>
        </Tooltip>
      </LinkNEvent>
    </>
  )
}

const UserHeader = observer(function UserHeader(props: Props) {
  const { note, dense, alignCenter = true } = props
  const { user } = note

  return (
    <Row sx={{ alignItems: alignCenter ? 'center' : 'flex-start', height: !alignCenter ? 42 : 46 }}>
      <UserAvatar user={user} dense={dense} />
      <Row>
        {user && <UserName user={user} sx={{ maxWidth: 260, ml: 2 }} />}
        <UserHeaderDate note={note} />
      </Row>
    </Row>
  )
})

export default UserHeader
