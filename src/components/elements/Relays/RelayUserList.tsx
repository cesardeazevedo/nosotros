import { Stack } from '@/components/ui/Stack/Stack'
import type { READ, UserRelay, WRITE } from '@/nostr/types'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { RelayFriendsList } from './RelayFriendsList'
import { RelayJoinButton } from './RelayJoinButton'
import { RelayUserChip } from './RelayUserChip'

type Props = {
  userRelays?: UserRelay[]
  renderAvatar?: boolean
  permission: typeof READ | typeof WRITE
}

export const RelayUserList = memo(function RelayUserList(props: Props) {
  const { userRelays = [], permission } = props
  return (
    <Stack horizontal={false} gap={0.5} justify='space-between' sx={styles.root}>
      {userRelays.map((userRelay, index) => (
        <Stack
          key={userRelay.relay}
          align='center'
          justify='space-between'
          sx={[styles.row, index !== userRelays.length && styles.row$border]}>
          <RelayUserChip key={userRelay.relay} userRelay={userRelay} />
          <Stack gap={1} justify='space-between'>
            <RelayFriendsList url={userRelay.relay} />
            <html.span style={styles.button}>
              <RelayJoinButton relay={userRelay.relay} permission={permission} />
            </html.span>
          </Stack>
        </Stack>
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
  row$border: {
    borderBottom: '1px solid',
    borderBottomColor: palette.outlineVariant,
  },
  button: {
    width: 80,
    textAlign: 'right',
  },
})
