import { IconUsersGroupFilled } from '@/components/elements/Icons/IconUsersGroupFilled'
import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { dedupe } from '@/core/helpers/dedupe'
import type { Event } from '@/stores/events/event'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'

type Props = {
  events: Event[]
}

export const FollowSetChip = (props: Props) => {
  const { events } = props
  const isMultipleList = events.length > 1
  const title = events?.[0]?.getTag('title')
  const pubkeys = dedupe(events.flatMap((x) => x.getTags('p')))
  return (
    <Popover
      floatingStrategy='fixed'
      placement='bottom-start'
      contentRenderer={(props) => (
        <Paper outlined elevation={4} surface='surfaceContainerLow' sx={styles.popover}>
          <Stack sx={styles.header} justify='space-between'>
            <Text size='lg'>{isMultipleList ? 'Follow Sets' : title}</Text>
            <UsersAvatars borderColor='surfaceContainerLow' pubkeys={pubkeys} />
            <Button
              variant='filled'
              onClick={() => {
                props.close()
                dialogStore.setListForm(events[0])
              }}>
              Edit
            </Button>
          </Stack>
          <Stack horizontal={false} align='flex-start' gap={0.5}></Stack>
        </Paper>
      )}>
      {({ getProps, setRef, open }) => (
        <Chip
          {...getProps()}
          ref={setRef}
          label={isMultipleList ? 'Follow Sets' : title}
          icon={<IconUsersGroupFilled size={18} />}
          trailingIcon={<IconButton size='sm'>{pubkeys.length}</IconButton>}
          onClick={open}
        />
      )}
    </Popover>
  )
}

const styles = css.create({
  header: {
    padding: spacing.padding1,
  },
  popover: {
    width: 240,
    position: 'relative',
    right: spacing.margin1,
    padding: spacing.padding1,
  },
})
