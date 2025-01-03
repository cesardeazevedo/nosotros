import { Chip } from '@/components/ui/Chip/Chip'
import { chipTokens } from '@/components/ui/Chip/Chip.stylex'
import type { Props as StackProps } from '@/components/ui/Stack/Stack'
import { Stack } from '@/components/ui/Stack/Stack'
import type { Props as TextProps } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { typeScale } from '@/themes/typeScale.stylex'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { css } from 'react-strict-dom'
import type { Note } from '@/stores/notes/note'
import type { Props as UserAvatarProps } from './UserAvatar'
import { UserAvatar } from './UserAvatar'
import { UserHeaderDate } from './UserHeaderDate'
import { UserName } from './UserName'
import { UserNIP05 } from './UserNIP05'

type Props = StackProps & {
  note?: Note
  pubkey?: string
  dense?: boolean
  children?: React.ReactNode
  userAvatarProps?: UserAvatarProps
  size?: TextProps['size']
  renderNIP05?: boolean
  disableLink?: boolean
}

export const UserHeader = observer(function UserHeader(props: Props) {
  const {
    pubkey: pubkeyProp,
    note,
    dense,
    disableLink,
    children,
    size,
    userAvatarProps,
    renderNIP05 = true,
    ...rest
  } = props
  if (!pubkeyProp && !note?.event.pubkey) {
    return
  }
  const pubkey = props.pubkey || note?.event.pubkey
  return (
    <Stack horizontal gap={2} align='center' sx={styles.root} {...rest}>
      <UserAvatar pubkey={pubkey} size={dense ? 'sm' : 'md'} disableLink={disableLink} {...userAvatarProps} />
      <Stack horizontal={false} gap={0}>
        <Stack horizontal gap={1} align='center' justify='flex-start'>
          <UserName pubkey={pubkey} disableLink={disableLink} size={size} />
          {note?.pow && (
            <Tooltip cursor='arrow' text={'This note was created with proof of work'}>
              <Chip sx={styles.pow} variant='assist' label={`PoW-${note.pow[2]}`} />
            </Tooltip>
          )}
          {note && <UserHeaderDate nevent={note.nevent} date={note.event.created_at} disableLink={disableLink} />}
        </Stack>
        {renderNIP05 && <UserNIP05 pubkey={pubkey} />}
        {children}
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    height: 40, // 42
  },
  pow: {
    [chipTokens.leadingSpace]: 1,
    [chipTokens.trailingSpace]: 4,
    [chipTokens.containerHeight]: 20,
    [chipTokens.labelTextSize]: typeScale.bodySize$sm,
    opacity: 0.9,
    verticalAlign: 'super',
  },
})
