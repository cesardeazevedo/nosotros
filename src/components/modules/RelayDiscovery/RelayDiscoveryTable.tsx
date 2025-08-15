import { RelayTableHeader } from '@/components/elements/Relays/RelayTableHeader'
import { RelayTableRowLoading } from '@/components/elements/Relays/RelayTableRowLoading'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import type { RelayDiscoveryFeed } from '@/hooks/state/useRelayDiscoveryFeed'
import { spacing } from '@/themes/spacing.stylex'
import { memo, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { RelayDiscoveryRow } from './RelayDiscoveryRow'

type Props = {
  feed: RelayDiscoveryFeed
}

export const RelayDiscoveryTable = memo(function RelayDiscoveryTable(props: Props) {
  const { feed } = props
  const list = useMemo(() => feed.query.data?.pages.flat() || [], [feed.query.data])
  return (
    <Stack horizontal={false}>
      {feed.list.length === 0 ? (
        <RelayTableRowLoading />
      ) : (
        <table cellPadding={1}>
          <RelayTableHeader />
          <tbody>
            {list.map((event) => (
              <RelayDiscoveryRow key={event.id} event={event} />
            ))}
          </tbody>
        </table>
      )}
      <Stack sx={styles.footer} justify='center'>
        <Button variant='filledTonal' sx={styles.button} onClick={() => feed.paginate()}>
          Load More
        </Button>
      </Stack>
    </Stack>
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
