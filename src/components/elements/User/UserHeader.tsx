import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { palette } from '@/themes/palette.stylex'
import { DateTime } from 'luxon'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { css } from 'react-strict-dom'
import type Note from 'stores/models/note'
import { userStore } from 'stores/nostr/users.store'
import LinkNEvent from '../Links/LinkNEvent'
import UserAvatar from './UserAvatar'
import UserName from './UserName'

type Props = {
  note: Note
  // TODO
  // pubkey: string
  // date?: number
  dense?: boolean
  alignCenter?: boolean
  disableLink?: boolean
}

export const UserHeaderDate = function UserHeaderDate(props: { note: Note; disableLink?: boolean }) {
  const { note, disableLink } = props

  const createdAt = note.event.created_at
  const shortDate = useMemo(
    () => DateTime.fromSeconds(createdAt).toRelative({ style: 'narrow' })?.replace('ago', ''),
    [createdAt],
  )
  const fullDate = useMemo(() => DateTime.fromSeconds(createdAt).toLocaleString(DateTime.DATETIME_FULL), [createdAt])
  return (
    <LinkNEvent underline note={note} disableLink={disableLink}>
      <Tooltip text={fullDate}>
        <Text size='sm' sx={styles.shortDate}>
          {shortDate}
        </Text>
      </Tooltip>
    </LinkNEvent>
  )
}

const UserHeader = observer(function UserHeader(props: Props) {
  const { note, dense, alignCenter = true, disableLink } = props
  const user = userStore.get(note.event.pubkey)
  return (
    <Stack horizontal gap={2} align={alignCenter ? 'center' : 'flex-start'} sx={styles.root}>
      <UserAvatar user={user} size={dense ? 'sm' : 'md'} disableLink={disableLink} />
      <UserName user={user} disableLink={disableLink} />
      <UserHeaderDate note={note} disableLink={disableLink} />
    </Stack>
  )
})

const styles = css.create({
  root: {
    height: 46, // 42
  },
  shortDate: {
    whiteSpace: 'nowrap',
    color: palette.onSurfaceVariant,
  },
  name: {},
})

export default UserHeader
