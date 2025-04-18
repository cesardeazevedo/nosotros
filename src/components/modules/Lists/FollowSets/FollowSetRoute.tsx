import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentUser } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { FollowSetCard } from './FollowSetCard'

export const FollowSetRoute = observer(function FollowSetRoute() {
  const user = useCurrentUser()
  return (
    <>
      <Text variant='title' size='lg' sx={styles.subheader}>
        My custom follow sets
      </Text>
      <Stack wrap gap={2} sx={styles.content} align='stretch'>
        {user?.followSets.map((event) => <FollowSetCard key={event.id} event={event} renderEdit />)}
      </Stack>
      <Text variant='title' size='lg' sx={styles.subheader}>
        People's follow sets
      </Text>
      <Stack wrap gap={2} sx={styles.content} align='stretch'>
        {user?.othersFollowSets.map((event) => <FollowSetCard key={event.id} event={event} renderAvatars={false} />)}
      </Stack>
    </>
  )
})

const styles = css.create({
  content: {
    padding: spacing.padding2,
  },
  subheader: {
    position: 'relative',
    marginTop: spacing.margin2,
    marginLeft: spacing.margin3,
  },
})
