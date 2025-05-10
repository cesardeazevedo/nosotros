import { RelayChip } from '@/components/elements/Relays/RelayChip'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useRootStore } from '@/hooks/useRootStore'
import type { NostrContext } from '@/nostr/context'
import { getRelaysFromContext } from '@/nostr/observables/getRelaysFromContext'
import { toStream } from '@/stores/helpers/toStream'
import { relaysStore } from '@/stores/relays/relays.store'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconLockExclamation } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import React, { useRef } from 'react'
import { css } from 'react-strict-dom'
import { combineLatestWith, map, mergeMap } from 'rxjs'

type Props = {
  context: NostrContext
}

export const FeedAuthNotice = observer((props: Props) => {
  const { context } = props
  const root = useRootStore()
  const router = useRouter()
  const startedTime = useRef(Date.now())

  const context$ = useObservable((context$) => context$.pipe(pluckFirst, mergeMap(getRelaysFromContext)), [context])

  const [relays] = useObservableState(
    () =>
      context$.pipe(
        combineLatestWith(toStream(() => [...relaysStore.auths.keys()])),
        map(([relays, authRelays]) => {
          return [...new Set(relays).intersection(new Set(authRelays))]
        }),
      ),
    [],
  )

  const authenticate = (relay: string) => {
    root.globalContext.toggleAuthRelay(relay)
    // Invalidate route after authentication after 10 seconds, as the subscription was likely closed
    if ((Date.now() - startedTime.current) / 1000 > 10) {
      router.invalidate()
    }
  }

  return (
    <>
      {relays.length > 0 && (
        <>
          <Stack horizontal sx={styles.row} gap={2} justify='space-between'>
            <Text variant='title'>Relays authentication</Text>
          </Stack>
          <Divider />
        </>
      )}
      {relays.map((relay) => (
        <React.Fragment key={relay}>
          <Stack horizontal key={relay} sx={styles.row} gap={2} justify='space-between'>
            <Stack gap={1}>
              <IconLockExclamation color={colors.yellow7} size={20} strokeWidth='1.8' />
              <RelayChip url={relay} />
            </Stack>
            <Button variant='filledTonal' onClick={() => authenticate(relay)}>
              Authenticate
            </Button>
          </Stack>
          <Divider />
        </React.Fragment>
      ))}
    </>
  )
})

const styles = css.create({
  row: {
    padding: spacing.padding1,
  },
})
