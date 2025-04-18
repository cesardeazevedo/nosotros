import { IconExpandable } from '@/components/elements/Icons/IconExpandable'
import { RouteHeader } from '@/components/elements/Layouts/RouteHeader'
import { NotificationSettings } from '@/components/modules/Notifications/NotificationSettings'
import { Button } from '@/components/ui/Button/Button'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedModule } from '@/stores/modules/feed.module'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'

type Props = {
  module?: FeedModule
}

export const NotificationHeader = observer(function NotificationHeader(props: Props) {
  const { module } = props
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <RouteHeader label='Notifications'>
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
      </RouteHeader>
      <Expandable expanded={expanded}>{module && <NotificationSettings module={module} />}</Expandable>
    </>
  )
})
