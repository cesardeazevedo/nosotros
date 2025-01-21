import { AppBar } from '@/components/ui/AppBar/AppBar'
import type { Props as SlideProps } from '@/components/ui/Slide/Slide'
import { Slide } from '@/components/ui/Slide/Slide'
import { Stack } from '@/components/ui/Stack/Stack'
import { useScrollTrigger } from '@/hooks/useScrollTrigger'
import { spacing } from '@/themes/spacing.stylex'
import { useMatch } from '@tanstack/react-router'
import { useMobile } from 'hooks/useMobile'
import { useNostrRoute } from 'hooks/useNavigations'
import React from 'react'
import { css, html } from 'react-strict-dom'
import { CenteredContainer } from '../Layouts/CenteredContainer'
import { NavigationHeader } from '../Navigation/NavigationHeader'
import { Sidebar } from '../Navigation/Sidebar'
import { TopNavigation } from '../Navigation/TopNavigation'
import { RelayPopoverSummary } from '../Relays/RelayPopoverSummary'
import { SettingsPopover } from '../Settings/SettingsPopover'
import { HeaderLogo } from './HeaderLogo'
import { HeaderSignIn } from './HeaderSignIn'

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

export const Header = React.memo(function Header() {
  const isMobile = useMobile()
  useMatch({ from: '__root__' })

  const isNostrRoute = !!useNostrRoute()

  // const HideOnScrollContainer = isMobile ? HideOnScroll : React.Fragment

  return (
    <>
      <AppBar>
        {isMobile && (
          <Stack align='center' justify='space-between' gap={2} sx={styles.content$mobile}>
            {!isNostrRoute && <Sidebar />}
            {!isNostrRoute && <HeaderLogo />}
            {isNostrRoute && <NavigationHeader />}
            <RelayPopoverSummary />
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
                <SettingsPopover />
                <RelayPopoverSummary />
                <HeaderSignIn />
              </Stack>
            </html.div>
          </>
        )}
      </AppBar>
    </>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
  },
  leading: {
    position: 'absolute',
    left: spacing.margin3,
  },
  trailing: {
    position: 'absolute',
    right: spacing.margin3,
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 0,
    marginTop: 0,
  },
  content$mobile: {
    width: '100%',
  },
})
