import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import { useMobile } from '@/hooks/useMobile'
import { useCurrentUser } from '@/hooks/useRootStore'
import { eventStore } from '@/stores/events/event.store'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { StarterPackCard } from './StarterPackCard'
import { StarterPackLink } from './StarterPackLink'

export const StarterPackRoute = observer(function FollowSetRoute() {
  const user = useCurrentUser()
  const starterPacks = eventStore.getEventsByKind(Kind.StarterPack)
  const isMobile = useMobile()
  return (
    <Stack horizontal={false} sx={styles.root} gap={4}>
      <Stack align='center' gap={1} justify='space-between'>
        <Text variant='title' size='lg'>
          Starter Packs
        </Text>
        <Button disabled={!user} variant='filled' onClick={() => dialogStore.setListForm(Kind.StarterPack)}>
          Create Starter Pack
        </Button>
      </Stack>
      {user && user?.starterPacks.length !== 0 && (
        <Stack horizontal={false} gap={2}>
          <Text variant='title' size='lg'>
            My custom follow sets
          </Text>
          <Stack wrap gap={2} align='stretch'>
            {user?.starterPacks.map((event) => (
              <StarterPackLink
                key={event.id}
                event={event}
                {...css.props([styles.link, isMobile && styles.link$mobile])}>
                <StarterPackCard event={event} sx={[styles.card, isMobile && styles.card$mobile]} />
              </StarterPackLink>
            ))}
          </Stack>
        </Stack>
      )}
      <Stack horizontal={false} gap={2}>
        {user && user?.starterPacks.length !== 0 && (
          <Stack align='center' gap={1} justify='space-between'>
            <Text variant='title' size='lg'>
              Other Starter Packs
            </Text>
          </Stack>
        )}
        <Stack wrap gap={2} align='stretch'>
          {starterPacks.map((event) => (
            <StarterPackLink key={event.id} event={event} {...css.props([styles.link, isMobile && styles.link$mobile])}>
              <StarterPackCard event={event} sx={[styles.card, isMobile && styles.card$mobile]} />
            </StarterPackLink>
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    padding: spacing.padding2,
  },
  card: {
    height: '100%',
  },
  link: {
    flex: '0 0 calc((100% - 2rem) / 3)',
    alignSelf: 'stretch',
  },
  link$mobile: {
    flex: 1,
  },
  card$mobile: {
    width: '100%',
  },
})
