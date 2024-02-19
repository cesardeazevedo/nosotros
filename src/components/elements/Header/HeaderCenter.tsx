import { IconButton, Typography } from '@mui/material'
import { IconChevronLeft } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import { useCurrentRoute, useGoBack, useNostrRoute } from 'hooks/useNavigations'
import { useStore } from 'hooks/useStore'
import { Observer } from 'mobx-react-lite'
import { isNprofile, isNpub } from 'utils/nip19'
import { Row } from '../Layouts/Flex'
import Search from '../Search/Search'

function HeaderCenter() {
  const store = useStore()
  const isMobile = useMobile()
  const handleBack = useGoBack()
  const route = useCurrentRoute()
  const nostrRoute = useNostrRoute()
  const context = nostrRoute?.context

  const isNostrRoute = route.routeId === '/$nostr'

  return (
    <>
      {!isNostrRoute && !isMobile && <Search />}
      {isNostrRoute && (
        <Row>
          <IconButton sx={{ color: 'inherit' }} onClick={handleBack}>
            <IconChevronLeft color='currentColor' />
          </IconButton>
          <Observer>
            {() => (
              <Typography variant='h6' sx={{ ml: 2 }}>
                {isNpub(context?.decoded) || isNprofile(context?.decoded)
                  ? store.users.getUserById(context.id)?.displayName
                  : 'Post'}
              </Typography>
            )}
          </Observer>
        </Row>
      )}
    </>
  )
}

export default HeaderCenter
