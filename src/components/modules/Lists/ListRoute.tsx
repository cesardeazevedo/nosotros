import { HeaderBase } from '@/components/elements/Layouts/HeaderBase'
import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { Text } from '@/components/ui/Text/Text'
import { useLG } from '@/hooks/useMobile'
import { useResetScroll } from '@/hooks/useResetScroll'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { Link, Outlet } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

export const ListsRoute = observer(function ListsRoute() {
  const isLG = useLG()
  const pubkey = useCurrentPubkey()
  useResetScroll()
  return (
    <RouteContainer
      maxWidth='lg'
      headline={
        !isLG && (
          <Text variant='headline' size='md' sx={styles.headline}>
            Lists
          </Text>
        )
      }
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
