import { HeaderBase } from '@/components/elements/Layouts/HeaderBase'
import { NotificationSettings } from '@/components/modules/Notifications/NotificationSettings'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import type { NotificationFeedState } from '@/hooks/state/useNotificationFeed'
import { IconAdjustments } from '@tabler/icons-react'
import { memo, useState } from 'react'

type Props = {
  feed: NotificationFeedState
}

export const NotificationHeader = memo(function NotificationHeader(props: Props) {
  const { feed } = props
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <HeaderBase leading='Notifications'>
        <IconButton
          selected={expanded}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setExpanded((prev) => !prev)
          }}>
          <IconAdjustments size={18} />
        </IconButton>
      </HeaderBase>
      <Expandable expanded={expanded}>
        <NotificationSettings feed={feed} onClose={() => setExpanded(false)} />
      </Expandable>
    </>
  )
})
