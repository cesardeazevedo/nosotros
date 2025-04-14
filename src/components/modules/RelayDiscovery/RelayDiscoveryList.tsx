import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import type { RelayDiscoveryModule } from '@/stores/modules/relay.discovery.module'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { RelayDiscoveryRow } from './RelayDiscoveryRow'

type Props = {
  module: RelayDiscoveryModule
}

export const RelayDiscoveryList = observer(function RelayDiscoveryList(props: Props) {
  const { module } = props
  return (
    <>
      <Stack horizontal={false}>
        {module.sortedByUsers.length === 0 ? (
          <></>
        ) : (
          <>
            {module.sortedByUsers.map((event) => (
              <RelayDiscoveryRow table={false} key={event.id} event={event.event} />
            ))}
          </>
        )}
        <Stack sx={styles.footer} justify='center'>
          <Button variant='filledTonal' sx={styles.button} onClick={() => {}}>
            Load More
            {/* {relayDiscoveryStore.left ? `(${relayDiscoveryStore.left})` : ''} */}
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
