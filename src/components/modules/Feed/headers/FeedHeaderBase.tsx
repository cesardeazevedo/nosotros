import { IconExpandable } from '@/components/elements/Icons/IconExpandable'
import type { Props as RouteHeaderProps } from '@/components/elements/Layouts/RouteHeader'
import { RouteHeader } from '@/components/elements/Layouts/RouteHeader'
import { Button } from '@/components/ui/Button/Button'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedStore } from '@/stores/feeds/feed.store'
import { useState } from 'react'
import { FeedSettings } from '../FeedSettings'

type Props = RouteHeaderProps & {
  feed?: FeedStore
}

export const FeedHeaderBase = (props: Props) => {
  const [expanded, setExpanded] = useState(false)
  const { feed, ...rest } = props
  return (
    <>
      <RouteHeader {...rest}>
        {feed && (
          <Button variant='filledTonal' onClick={() => setExpanded((prev) => !prev)}>
            <Stack gap={0.5}>
              <IconExpandable upwards strokeWidth='2.5' expanded={expanded} />
              Feed Settings
            </Stack>
          </Button>
        )}
      </RouteHeader>
      <Expandable expanded={expanded}>{feed && <FeedSettings feed={feed} />}</Expandable>
    </>
  )
}
