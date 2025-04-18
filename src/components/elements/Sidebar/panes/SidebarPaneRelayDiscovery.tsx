import { DeckScroll } from '@/components/modules/Deck/DeckScroll'
import { RelayDiscoveryHeader } from '@/components/modules/RelayDiscovery/RelayDiscoveryHeader'
import { RelayDiscoveryList } from '@/components/modules/RelayDiscovery/RelayDiscoveryList'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconLayoutSidebarLeftExpand } from '@tabler/icons-react'
import { Link, useRouter, useRouterState } from '@tanstack/react-router'
import { useContext, useEffect, type RefObject } from 'react'
import { css } from 'react-strict-dom'
import { SidebarContext } from '../SidebarContext'

type Props = {
  ref?: RefObject<null>
  sx?: SxProps
}

export const SidebarPaneRelayDiscovery = (props: Props) => {
  const router = useRouter()
  const context = useContext(SidebarContext)

  useEffect(() => {
    router.preloadRoute({ to: '/explore/relays' })
  }, [])

  const module = useRouterState({
    select: (state) => {
      const match =
        state.cachedMatches.find((x) => x.routeId === '/explore/relays') ||
        state.matches.find((x) => x.routeId === '/explore/relays')
      return match?.loaderData
    },
  })
  return (
    <Stack horizontal={false} ref={props.ref} justify='flex-start' sx={[styles.root, props.sx]}>
      {module && (
        <>
          <Stack horizontal sx={styles.settings}>
            <Stack horizontal={false} grow>
              <RelayDiscoveryHeader collapsed module={module} grow horizontal={false} justify='stretch'>
                <Link to='/explore/relays' onClick={() => context.setPane(false)}>
                  <IconButton size='sm'>
                    <IconLayoutSidebarLeftExpand size={22} />
                  </IconButton>
                </Link>
              </RelayDiscoveryHeader>
            </Stack>
          </Stack>
          <DeckScroll>
            <RelayDiscoveryList module={module} />
          </DeckScroll>
        </>
      )}
    </Stack>
  )
}

const styles = css.create({
  root: {
    width: 400,
    position: 'fixed',
    backgroundColor: palette.surfaceContainerLowest,
    borderRight: '1px solid',
    borderRightColor: palette.outlineVariant,
    borderTopRightRadius: shape.xl,
    borderBottomRightRadius: shape.xl,
    left: 84,
    top: 0,
    bottom: 0,
    zIndex: 50,
  },
  header: {
    width: '100%',
    padding: spacing.padding2,
    position: 'relative',
  },
  settings: {
    width: '100%',
  },
})
