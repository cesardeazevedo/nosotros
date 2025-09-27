import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { HeaderBase } from '@/components/elements/Layouts/HeaderBase'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { RelayMailboxList } from '@/components/elements/Relays/RelayMailboxList'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { Tabs } from '@/components/ui/Tabs/Tabs'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useCurrentRoute } from '@/hooks/useNavigations'
import { READ, WRITE } from '@/nostr/types'
import { spacing } from '@/themes/spacing.stylex'
import { Link, Outlet } from '@tanstack/react-router'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { RelayActiveHeader } from '../RelayActive/RelayActiveHeader'

export const RelayRoute = memo(function RelayRoute() {
  const current = useCurrentRoute()
  const pubkey = useCurrentPubkey()
  return (
    <>
      <CenteredContainer margin maxWidth='lg'>
        {pubkey && (
          <>
            <PaperContainer maxWidth='lg'>
              <HeaderBase label='Relay Settings' />
              <Divider />
              <Stack horizontal={false}>
                <Stack horizontal justify='space-between' align='flex-start' wrap>
                  <RelayMailboxList pubkey={pubkey} permission={WRITE} />
                  <Divider orientation='vertical' />
                  <RelayMailboxList pubkey={pubkey} permission={READ} />
                </Stack>
              </Stack>
            </PaperContainer>
            <br />
          </>
        )}
        <PaperContainer maxWidth='lg'>
          <Stack>
            <Stack sx={styles.tabs} align='center' justify='flex-start'>
              <Tabs anchor={current.routeId || ''}>
                <Link to='/relays'>
                  <Tab anchor='/relays/' label={<RelayActiveHeader />} />
                </Link>
                <Link to='/relays/monitor'>
                  <Tab anchor='/relays/monitor' label='Relay Monitor' />
                </Link>
              </Tabs>
            </Stack>
          </Stack>
          <Divider />
          <Outlet />
        </PaperContainer>
      </CenteredContainer>
    </>
  )
})

const styles = css.create({
  root: {
    // maxWidth: 960,
  },
  header: {
    // marginBottom: spacing.margin4,
  },
  header$mobile: {
    padding: spacing.padding2,
    paddingBottom: 0,
  },
  tabs: {
    padding: 12,
  },
})
