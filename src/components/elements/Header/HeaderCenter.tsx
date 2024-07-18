import { IconButton, Typography } from '@mui/material'
import { IconChevronLeft } from '@tabler/icons-react'
import { useCurrentRoute, useGoBack, useNostrRoute } from 'hooks/useNavigations'
import { Observer } from 'mobx-react-lite'
import { userStore } from 'stores/nostr/users.store'
import { isNprofile, isNpub } from 'utils/nip19'
import { Row } from '../Layouts/Flex'

function HeaderCenter() {
  // const isMobile = useMobile()
  const handleBack = useGoBack()
  const route = useCurrentRoute()

  const nostrRoute = useNostrRoute()

  // TODO: This needs better inference
  let context = null
  if (nostrRoute?.context && 'decoded' in nostrRoute.context) {
    context = nostrRoute.context
  }

  const isNostrRoute = route.routeId === '/$nostr'

  return (
    <>
      {/* {!isNostrRoute && !isMobile && <Search />} */}
      {isNostrRoute && (
        <Row>
          <IconButton sx={{ color: 'inherit' }} onClick={handleBack}>
            <IconChevronLeft color='currentColor' />
          </IconButton>
          <Observer>
            {() => (
              <Typography variant='h6' sx={{ ml: 2 }}>
                {isNpub(context?.decoded) || isNprofile(context?.decoded)
                  ? userStore.get(context.id)?.displayName
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
