import { RelayChip } from '@/components/elements/Relays/RelayChip'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { prettyRelayUrl } from '@/core/helpers/formatRelayUrl'
import { useRootStore } from '@/hooks/useRootStore'
import type { NostrContext } from '@/nostr/context'
import { getRelaysFromContext } from '@/nostr/observables/getRelaysFromContext'
import { toStream } from '@/stores/helpers/toStream'
import { relaysStore } from '@/stores/relays/relays.store'
import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
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
  const [contextRelays] = useObservableState(() => context$, [])

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

  if (contextRelays.length === 1 && relays[0] === contextRelays[0]) {
    const relay = relays[0]
    return (
      <Paper shape='xl' elevation={1} surface='surfaceContainerLow' sx={styles.box}>
        <Stack horizontal={false} gap={2} align='center'>
          <RelayChip url={relay} />
          <Text variant='title'>Relay {prettyRelayUrl(relay)} requires authentication</Text>
          <Button variant='filled' onClick={() => authenticate(relay)}>
            Authenticate
          </Button>
        </Stack>
      </Paper>
    )
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

const fadeIn = css.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

const DARK = '@media (prefers-color-scheme: dark)'

const styles = css.create({
  box: {
    position: 'absolute',
    width: '100%',
    height: 'calc(100% - 65px)',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    marginTop: 65,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: spacing.padding4,
    paddingTop: 200,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    backgroundColor: {
      [DARK]: 'rgba(0, 0, 0, 0.12)',
      default: 'rgba(255, 255, 255, 0.12)',
    },
    backdropFilter: 'blur(8px)',
    animation: fadeIn,
    animationTimingFunction: easing.emphasizedDecelerate,
    animationDuration: duration.short4,
    opacity: 1,
    zIndex: 50,
  },
  row: {
    padding: spacing.padding1,
  },
})
