import { useMobile } from '@/hooks/useMobile'
import { useCurrentRoute } from 'hooks/useNavigations'
import { NavigationHeader } from '../Navigation/NavigationHeader'
//import { TopNavigation } from '../Navigation/TopNavigation'
import HeaderLogo from './HeaderLogo'

function HeaderCenter() {
  const isMobile = useMobile()
  const route = useCurrentRoute()
  const isNostrRoute = route.routeId.startsWith('/$nostr')

  return (
    <>
      {/* {!isNostrRoute && !isMobile && <Search />} */}
      {!isNostrRoute && isMobile && <HeaderLogo />}
      {/* {!isNostrRoute && !isMobile && <TopNavigation />} */}
      {isNostrRoute && <NavigationHeader />}
    </>
  )
}

export default HeaderCenter
