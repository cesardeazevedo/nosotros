import { IconUsersGroupFilled } from '@/components/elements/Icons/IconUsersGroupFilled'
import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import { dedupe } from '@/core/helpers/dedupe'
import { eventStore } from '@/stores/events/event.store'
import type { FeedStore } from '@/stores/feeds/feed.store'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { FeedHeaderBase } from './FeedHeaderBase'

type Props = {
  feed: FeedStore
}

export const FeedHeaderFollowSet = observer(function FeedHeaderFollowSet(props: Props) {
  const { feed } = props
  const author = feed.filter.authors?.[0] || ''
  const d = feed.filter['#d']?.[0] || ''
  const events = d
    ? eventStore.getEventsByKindPubkeyTagValue(Kind.FollowSets, author, 'd', d)
    : eventStore.getEventsByKindPubkey(Kind.FollowSets, author)

  const isMultipleList = events.length > 1
  const title = events?.[0]?.getTag('title')
  const pubkeys = dedupe(events.flatMap((x) => x.getTags('p')))
  return (
    <FeedHeaderBase
      feed={feed}
      leading={
        <Stack gap={2}>
          <Text variant='title' size='lg'>
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
          </Text>
        </Stack>
      }
    />
  )
})

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
