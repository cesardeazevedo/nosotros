import { RelayListRowLoading } from '@/components/elements/Relays/RelayListRowLoading'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import type { RelayDiscoveryFeed } from '@/hooks/state/useRelayDiscoveryFeed'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { RelayDiscoveryRow } from './RelayDiscoveryRow'

type Props = {
  feed: RelayDiscoveryFeed
}

export const RelayDiscoveryList = memo(function RelayDiscoveryList(props: Props) {
  const { feed } = props
  return (
    <>
      <Stack horizontal={false}>
        {feed.list.length === 0 ? (
          <RelayListRowLoading />
        ) : (
          feed.list.map((event) => <RelayDiscoveryRow table={false} key={event.id} event={event} />)
        )}
        <Stack sx={styles.footer} justify='center'>
          <Button variant='filledTonal' sx={styles.button} onClick={() => feed.paginate()}>
            Load More
          </Button>
        </Stack>
      </Stack>
    </>
  )
})

const styles = css.create({
  footer: {
    padding: spacing.padding4,
  },
  button: {
    height: 50,
  },
})
