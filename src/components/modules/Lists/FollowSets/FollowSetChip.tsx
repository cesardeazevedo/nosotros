import { IconUsersGroupFilled } from '@/components/elements/Icons/IconUsersGroupFilled'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import { subscribeUser } from '@/nostr/subscriptions/subscribeUser'
import type { Event } from '@/stores/events/event'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { useObservable, useSubscription } from 'observable-hooks'
import { useState } from 'react'
import { css } from 'react-strict-dom'
import { filter, mergeMap } from 'rxjs'
import { FollowBulkButton } from '../../Follows/FollowBulkButton'
import { FollowButton } from '../../Follows/FollowButton'

type Props = {
  events: Event[]
}

export const FollowSetChip = observer(function FollowSetChip(props: Props) {
  const { events } = props
  const [open, setOpen] = useState(false)
  const pubkey = useCurrentPubkey()
  const isMultipleList = events.length > 1
  const pubkeys = events.flatMap((x) => x.getTags('p'))
  const title = events?.[0]?.getTag('title') + ` (${pubkeys.length})`
  const sub = useObservable(
    (input$) => {
      return input$.pipe(
        filter(([, open]) => open),
        mergeMap(([pubkeys]) => pubkeys),
        mergeMap((pubkey) => subscribeUser(pubkey, {})),
      )
    },
    [pubkeys, open],
  )
  useSubscription(sub)

  return (
    <PopoverBase
      opened={open}
      onClose={() => setOpen(false)}
      floatingStrategy='fixed'
      placement='bottom-start'
      contentRenderer={() => (
        <Paper outlined surface='surfaceContainerLow' sx={styles.popover}>
          <Stack sx={styles.header} justify='space-between' gap={4}>
            <Text size='lg'>{isMultipleList ? 'Follow Sets' : title}</Text>
            <Stack gap={0.5}>
              {!isMultipleList && pubkey === events[0].pubkey && (
                <Button
                  variant='outlined'
                  onClick={() => {
                    setOpen(false)
                    dialogStore.setListForm(events[0])
                  }}>
                  Edit
                </Button>
              )}
              <FollowBulkButton pubkeys={pubkeys} />
            </Stack>
          </Stack>
          <Stack horizontal={false} align='stretch' gap={0.5} sx={styles.maxHeight}>
            {pubkeys.map((pubkey) => (
              <Stack grow key={pubkey} justify='space-between' gap={2}>
                <Stack sx={styles.userHeader}>
                  <UserHeader grow key={pubkey} pubkey={pubkey} userAvatarProps={{ size: 'sm' }} />
                </Stack>
                <FollowButton pubkey={pubkey} sx={styles.followButton} />
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}>
      {({ getProps, setRef }) => (
        <Chip
          {...getProps()}
          ref={setRef}
          label={isMultipleList ? 'Follow Sets' : title}
          icon={<IconUsersGroupFilled size={18} />}
          onClick={() => setOpen(true)}
        />
      )}
    </PopoverBase>
  )
})

const styles = css.create({
  header: {
    padding: spacing.padding1,
  },
  popover: {
    minWidth: 240,
    position: 'relative',
    right: spacing.margin1,
  },
  maxHeight: {
    overflowY: 'auto',
    padding: spacing.padding1,
    maxHeight: 400,
  },
  userHeader: {
    flex: 1,
    minWidth: 200,
  },
  followButton: {
    width: 76,
    minWidth: 76,
    minHeight: 30,
  },
})
