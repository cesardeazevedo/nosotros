import { Avatar, Box, Button, Link, Theme, Typography } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'
import { bindHover, bindPopover } from 'material-ui-popup-state'
import { usePopupState } from 'material-ui-popup-state/hooks'
import React from 'react'
import { Link as RouterLink } from 'react-router-dom'

import { useDelayPopover } from 'hooks/useDelayPopover'
import { useMobile } from 'hooks/useMobile'
import HoverPopover from 'material-ui-popup-state/HoverPopover'
import { Observer } from 'mobx-react-lite'
import { useStore } from 'stores'
import { UserState } from 'stores/nostr/user.store'
import TextContent from '../Texts/TextContent'

type Props = {
  user?: UserState
  children: React.ReactNode
}

function UserPopover(props: Props) {
  const popupState = usePopupState({ variant: 'popover', popupId: 'user-popup' })
  const open = useDelayPopover(popupState)

  const isMobile = useMobile()
  const store = useStore()
  const { user } = props

  if (isMobile) {
    // We are disabling this component on mobile, in the future we want to do a lot more sophisticated,
    // but for now, it will just cause annoying problems.
    return props.children
  }

  return (
    <>
      <Box {...bindHover(popupState)} component='span'>
        {props.children}
      </Box>
      <HoverPopover
        {...bindPopover(popupState)}
        slotProps={{
          paper: {
            sx: {
              pointerEvents: 'auto',
              backgroundColor: (theme) => `rgba(${(theme as Theme).palette.common.backgroundChannel} / 0.80)`,
              backdropFilter: 'blur(4px)',
            },
          },
        }}
        TransitionProps={{ in: open }}
        transitionDuration={{ enter: 200, exit: 200 }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}>
        <Observer>
          {() => (
            <Box sx={{ width: 300, maxHeight: 270, p: 2 }}>
              <Row sx={{ justifyContent: 'space-between' }}>
                <Avatar src={user?.picture} sx={{ width: 60, height: 60 }}>
                  {user?.name}
                </Avatar>
                <Button sx={{ minWidth: 95 }} variant='contained' color='info'>
                  Follow
                </Button>
              </Row>
              <Link component={RouterLink} to={`/${user?.npub}`}>
                <Typography variant='h6' sx={{ mt: 1, lineHeight: 1.2 }}>
                  {user?.name}
                </Typography>
              </Link>
              <Box sx={{ mt: 1 }}>
                {store.users.getContentById(user?.id).map((token, index) => (
                  <TextContent dense key={token.kind + token.content.toString() + index} token={token} />
                ))}
              </Box>
            </Box>
          )}
        </Observer>
      </HoverPopover>
    </>
  )
}

export default UserPopover
