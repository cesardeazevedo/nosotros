import { ButtonBase } from '@/components/ui/ButtonBase/ButtonBase'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { useCurrentUser } from '@/hooks/useRootStore'
import { userRelayStore } from '@/stores/userRelays/userRelay.store'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { useDeferredValue } from 'react'
import { css } from 'react-strict-dom'
import { UserAvatar } from '../User/UserAvatar'

type Props = {
  relay: string
}

export const RelayFriendsList = observer(function RelayFriendsList(props: Props) {
  const { relay } = props
  const user = useCurrentUser()
  const users = userRelayStore.getPubkeysFromRelay(relay)
  const usersDeffered = useDeferredValue(users)
  const usersFollowings = usersDeffered.filter((pubkey) => user?.following?.tags.get('p')?.has(pubkey))
  const topusers = usersFollowings.slice(0, 3)

  return (
    <Stack justify='flex-end' gap={0.5}>
      {usersFollowings.length > 3 && (
        <TooltipRich
          openEvents={{ click: true, hover: false }}
          content={() => (
            <Paper elevation={2} surface='surfaceContainerLow' sx={styles.tooltip}>
              <Text variant='title' size='sm'>
                {usersFollowings.length} people you follow joined {relay}
              </Text>
              <Stack wrap sx={styles.wrapper}>
                {usersFollowings.map((pubkey) => (
                  <UserAvatar key={pubkey} sx={styles.avatar2} size='xs' pubkey={pubkey} />
                ))}
              </Stack>
            </Paper>
          )}>
          <ButtonBase sx={styles.more}>
            <Text variant='body' size='sm'>
              +{usersFollowings.length - 3}
            </Text>
          </ButtonBase>
        </TooltipRich>
      )}
      <Stack>
        {topusers.map((pubkey) => (
          <UserAvatar key={pubkey} sx={styles.avatar} size='xs' pubkey={pubkey} />
        ))}
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  avatar: {
    marginLeft: -8,
    boxShadow: `0px 0px 0px 2px ${palette.surfaceContainerLowest}`,
  },
  avatar2: {
    marginLeft: -6,
    border: '2px solid',
    borderColor: palette.surfaceContainerLowest,
  },
  more: {
    left: -6,
    backgroundColor: palette.surfaceContainer,
    borderRadius: shape.xs,
    paddingInline: 4,
    paddingBlock: 2,
    fontWeight: 500,
    fontSize: '80%',
  },
  tooltip: {
    padding: spacing.padding1,
    maxWidth: 356,
  },
  wrapper: {
    padding: spacing.padding1,
    marginTop: spacing.margin1,
    maxHeight: 240,
    overflowY: 'auto',
  },
})
