import { AppBar } from '@/components/ui/AppBar/AppBar'
import type { Props as SlideProps } from '@/components/ui/Slide/Slide'
import { Slide } from '@/components/ui/Slide/Slide'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import { useScrollTrigger } from '@/hooks/useScrollTrigger'
import { spacing } from '@/themes/spacing.stylex'
import { useMatch } from '@tanstack/react-router'
import { useMobile } from 'hooks/useMobile'
import { useNostrRoute } from 'hooks/useNavigations'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { css, html } from 'react-strict-dom'
import { CenteredContainer } from '../Layouts/CenteredContainer'
import { NavigationHeader } from '../Navigation/NavigationHeader'
import { Sidebar } from '../Navigation/Sidebar'
import { TopNavigation } from '../Navigation/TopNavigation'
import { RelayPopoverSummary } from '../Relays/RelayPopoverSummary'
import { SettingsPopover } from '../Settings/SettingsPopover'
import { HeaderLogo } from './HeaderLogo'
import { HeaderSignIn } from './HeaderSignIn'
import { HeaderSearch } from './HeaderSearch'

// Way too buggy on ios, might not worth it
export const HideOnScroll = React.memo(
  (props: { direction?: SlideProps['direction']; children: React.ReactElement }) => {
    const { direction = 'down', children } = props
    const trigger = useScrollTrigger({ target: window, threshold: 100, disableHysteresis: false })

    return (
      <Slide appear={false} direction={direction} in={!trigger}>
        {children}
      </Slide>
    )
  },
)

type Props = {
  children: React.ReactNode
}

export const Header = observer(function Header(props: Props) {
  const isMobile = useMobile()
  const [searchOpen, setSearchOpen] = useState(false)
  useMatch({ from: '__root__' })

  const pubkey = useCurrentPubkey()
  const isNostrRoute = !!useNostrRoute()

  return (
    <>
      <AppBar>
        {isMobile && (
          <Stack align='center' justify='space-between' gap={0} sx={styles.content$mobile}>
            {!isNostrRoute && <Sidebar />}
            {!isNostrRoute && <HeaderLogo sx={[styles.logo$mobile, !!pubkey && styles.logo$logged]} />}
            {isNostrRoute && <NavigationHeader />}
            {pubkey ? <RelayPopoverSummary /> : <div />}
          </Stack>
        )}
        {!isMobile && (
          <>
            <html.div style={styles.leading}>
              <HeaderLogo />
            </html.div>
            <CenteredContainer sx={styles.content}>
              <TopNavigation />
            </CenteredContainer>
            <html.div style={styles.trailing}>
              <Stack gap={1}>
                <HeaderSearch
                  open={searchOpen}
                  onClick={() => setSearchOpen(true)}
                  onCancel={() => setSearchOpen(false)}
                />
                <SettingsPopover />
                {pubkey && <RelayPopoverSummary />}
                <HeaderSignIn />
              </Stack>
            </html.div>
          </>
        )}
      </AppBar>
      <html.div style={styles.body}>{props.children}</html.div>
    </>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
  },
  body: {
    marginTop: 64,
  },
  leading: {
    position: 'absolute',
    left: spacing.margin3,
  },
  trailing: {
    position: 'absolute',
    right: spacing.margin3,
  },
  logo$mobile: {
    flex: 1,
    marginLeft: -42,
  },
  logo$logged: {
    marginLeft: -110,
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 0,
    marginTop: 0,
  },
  content$mobile: {
    // flex: 1,
    width: '100%',
  },
})
