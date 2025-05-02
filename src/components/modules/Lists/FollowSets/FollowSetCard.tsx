import { IconUsersGroupFilled } from '@/components/elements/Icons/IconUsersGroupFilled'
import { PostHeaderDate } from '@/components/elements/Posts/PostHeaderDate'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
import { CardContent } from '@/components/ui/Card/CardContent'
import { CardTitle } from '@/components/ui/Card/CardTitle'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useSM } from '@/hooks/useMobile'
import type { Event } from '@/stores/events/event'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { FollowSetLink } from './FollowSetLink'

type Props = {
  event: Event
  renderEdit?: boolean
  renderAvatars?: boolean
}

export const FollowSetCard = observer(function FollowSetCard(props: Props) {
  const { event, renderEdit = false, renderAvatars = true } = props
  const isMobile = useSM()
  const title = event.getTag('title')
  const description = event.getTag('description')
  const d = event.getTag('d')
  const pubkeys = event.getTags('p') || []
  return (
    <Card key={event.id} variant='outlined' sx={[styles.root, isMobile && styles.root$mobile]}>
      <Stack horizontal={false}>
        <CardTitle
          headline={
            <Stack gap={1}>
              <UserHeader dense size='sm' pubkey={event.pubkey} />
              <PostHeaderDate date={event.event.created_at} dateStyle='long' />
            </Stack>
          }
        />
        <CardContent align='flex-start' sx={styles.content}>
          <CardTitle
            headline={title || <html.span style={styles.gray}>#{d?.slice(0, 20)}</html.span>}
            supportingText={description}
          />
          <Stack gap={3}>
            {!renderAvatars && (
              <Text variant='title' size='sm'>
                <Stack gap={1} justify='space-between'>
                  <IconUsersGroupFilled size={18} />
                  {pubkeys?.length}
                </Stack>
              </Text>
            )}
            {renderAvatars && <UsersAvatars pubkeys={pubkeys} />}
          </Stack>
        </CardContent>
      </Stack>
      <Stack gap={0.5}>
        <FollowSetLink event={event}>
          <Button variant='outlined'>See Feed</Button>
        </FollowSetLink>
        {renderEdit && (
          <Button variant='outlined' onClick={() => dialogStore.setListForm(event)}>
            Edit
          </Button>
        )}
      </Stack>
    </Card>
  )
})

const styles = css.create({
  root: {
    width: '40%',
    padding: 12,
  },
  root$mobile: {
    width: '100%',
  },
  content: {
    paddingBlock: spacing.padding2,
  },
  gray: {
    color: palette.onSurfaceVariant,
  },
})
