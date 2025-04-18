import { RelayTableHeader } from '@/components/elements/Relays/RelayTableHeader'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import type { RelayDiscoveryModule } from '@/stores/modules/relay.discovery.module'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { RelayTableRowLoading } from '../../elements/Relays/RelayTableRowLoading'
import { RelayDiscoveryRow } from './RelayDiscoveryRow'

type Props = {
  module: RelayDiscoveryModule
}

export const RelayDiscoveryTable = observer(function RelayDiscoveryTable(props: Props) {
  const { module } = props
  return (
    <Stack horizontal={false}>
      {module.sortedByUsers.length === 0 ? (
        <RelayTableRowLoading />
      ) : (
        <table cellPadding={1}>
          <RelayTableHeader usersSorted={module.sorted} onUsersColumnClick={() => module.toggleSorted()} />
          <tbody>
            {module.list.map((event) => (
              <RelayDiscoveryRow key={event.id} event={event.event} />
            ))}
          </tbody>
        </table>
      )}
      <Stack sx={styles.footer} justify='center'>
        <Button variant='filledTonal' sx={styles.button} onClick={() => module.feed.paginate()}>
          Load More
          {module.left ? ` (${module.left})` : ''}
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
