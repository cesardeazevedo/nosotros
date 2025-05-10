import { PostHeaderDate } from '@/components/elements/Posts/PostHeaderDate'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
import { CardContent } from '@/components/ui/Card/CardContent'
import { CardTitle } from '@/components/ui/Card/CardTitle'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useSM } from '@/hooks/useMobile'
import type { Event } from '@/stores/events/event'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconServerBolt } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { RelaySetLink } from './RelaySetLink'

type Props = {
  event: Event
  renderEdit?: boolean
}

export const RelaySetCard = observer(function RelaySetCard(props: Props) {
  const { event, renderEdit = false } = props
  const isMobile = useSM()
  const title = event.getTag('title')
  const description = event.getTag('description')
  const d = event.getTag('d')
  const relays = event.getTags('relay') || []
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
          <Stack gap={2}>
            <Text variant='title' size='sm'>
              <Stack gap={1} justify='space-between'>
                <IconServerBolt size={18} />
                {relays?.length}
              </Stack>
            </Text>
          </Stack>
        </CardContent>
      </Stack>
      <Stack gap={0.5}>
        <RelaySetLink event={event}>
          <Button variant='outlined'>See Feed</Button>
        </RelaySetLink>
        {renderEdit && <Button variant='outlined'>Edit</Button>}
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
