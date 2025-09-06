import { authRelaysAtom } from '@/atoms/relay.atoms'
import { toggleAuthRelayAtom } from '@/atoms/relayAuth.atoms'
import { RelayChip } from '@/components/elements/Relays/RelayChip'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { NostrContext } from '@/nostr/context'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconLockExclamation } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { useAtomValue, useSetAtom } from 'jotai'
import React, { useMemo, useRef } from 'react'
import { css } from 'react-strict-dom'

type Props = { context: NostrContext }

export const FeedAuthNotice = (props: Props) => {
  const { context } = props
  const router = useRouter()
  const startedTime = useRef(Date.now())
  const toggleRelayAuth = useSetAtom(toggleAuthRelayAtom)

  const authEntries = useAtomValue(authRelaysAtom)
  const authSet = useMemo(() => new Set(authEntries.map(([url]) => formatRelayUrl(url))), [authEntries])

  // only show auth-needed relays that are in this feed's context
  const relaysNeedingAuth = useMemo(
    () => context.relays?.map(formatRelayUrl).filter((url) => authSet.has(url)) || [],
    [context.relays, authSet],
  )

  function authenticate(relay: string) {
    toggleRelayAuth(relay)
    // if user took a while, refresh the route to resubscribe
    if ((Date.now() - startedTime.current) / 1000 > 10) {
      router.invalidate()
    }
  }

  if (relaysNeedingAuth.length === 0) {
    return null
  }

  return (
    <>
      {relaysNeedingAuth.map((relay) => (
        <React.Fragment key={relay}>
          <Stack horizontal sx={styles.row} gap={2} justify='space-between'>
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
}

const styles = css.create({
  row: {
    padding: spacing.padding1,
  },
})
