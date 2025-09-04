import { HeaderBase } from '@/components/elements/Layouts/HeaderBase'
import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useResetScroll } from '@/hooks/useResetScroll'
import { spacing } from '@/themes/spacing.stylex'
import { Link, Outlet } from '@tanstack/react-router'
import { memo } from 'react'
import { css } from 'react-strict-dom'

export const ListsRoute = memo(function ListsRoute() {
  useResetScroll()
  const pubkey = useCurrentPubkey()
  return (
    <RouteContainer
      maxWidth='lg'
      header={
        <HeaderBase
          leading={
            <Stack justify='flex-start' align='flex-start'>
              <Link to='/lists' activeOptions={{ exact: true }}>
                {({ isActive }) => <Tab active={isActive} sx={styles.tab} anchor='starter' label='Starter Packs' />}
              </Link>
              <Link disabled={!pubkey} to='/lists/followsets' activeOptions={{ exact: true }}>
                {({ isActive }) => (
                  <Tab disabled={!pubkey} active={isActive} sx={styles.tab} anchor='followset' label='Follow Sets' />
                )}
              </Link>
              <Link disabled={!pubkey} to='/lists/relaysets'>
                {({ isActive }) => (
                  <Tab disabled={!pubkey} active={isActive} sx={styles.tab} anchor='relaysets' label='Relay Sets' />
                )}
              </Link>
            </Stack>
          }
        />
      }>
      <Outlet />
    </RouteContainer>
  )
})

const styles = css.create({
  tab: {
    height: 48,
  },
  headline: {
    marginBottom: spacing.margin4,
  },
})
