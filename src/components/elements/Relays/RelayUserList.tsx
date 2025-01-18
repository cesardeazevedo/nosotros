import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { READ, UserRelay, WRITE } from '@/nostr/types'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { css, html } from 'react-strict-dom'
import { RelayFriendsList } from './RelayFriendsList'
import { RelayJoinButton } from './RelayJoinButton'
import { RelayUserChip } from './RelayUserChip'

type Props = {
  isEditing?: boolean
  userRelays?: UserRelay[]
  renderAvatar?: boolean
  permission: typeof READ | typeof WRITE
}

export const RelayUserList = observer(function RelayUserList(props: Props) {
  const { userRelays = [], isEditing, permission } = props
  return (
    <Stack horizontal={false} gap={0.5} justify='space-between' sx={styles.root}>
      {userRelays.map((userRelay, index) => (
        <React.Fragment key={userRelay.relay}>
          <Stack align='center' justify='space-between' sx={styles.row}>
            <RelayUserChip key={userRelay.relay} userRelay={userRelay} />
            <Stack gap={1} justify='space-between'>
              <RelayFriendsList relay={userRelay.relay} />
              <html.span style={styles.button}>
                {isEditing && <RelayJoinButton relay={userRelay.relay} permission={permission} />}
                {!isEditing && <Button variant='filledTonal'>Explore</Button>}
              </html.span>
            </Stack>
          </Stack>
          {index !== userRelays.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: '100%',
  },
  row: {
    padding: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  button: {
    width: 80,
    textAlign: 'right',
  },
})
