import { IconExpandable } from '@/components/elements/Icons/IconExpandable'
import { HeaderBase } from '@/components/elements/Layouts/HeaderBase'
import { NotificationSettings } from '@/components/modules/Notifications/NotificationSettings'
import { Button } from '@/components/ui/Button/Button'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NotificationFeedState } from '@/hooks/state/useNotificationFeed'
import { memo, useState } from 'react'

type Props = {
  feed: NotificationFeedState
}

export const NotificationHeader = memo(function NotificationHeader(props: Props) {
  const { feed } = props
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <HeaderBase label='Notifications'>
        <Button
          variant='filledTonal'
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setExpanded((prev) => !prev)
          }}>
          <Stack gap={0.5}>
            <IconExpandable upwards expanded={expanded} />
            Settings
          </Stack>
        </Button>
      </HeaderBase>
      <Expandable expanded={expanded}>
        <NotificationSettings feed={feed} />
      </Expandable>
    </>
  )
})
