import { Box, Button, type Theme } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'
import { useDelayPopover } from 'hooks/useDelayPopover'
import { useMobile } from 'hooks/useMobile'
import { bindHover, bindPopover } from 'material-ui-popup-state'
import HoverPopover from 'material-ui-popup-state/HoverPopover'
import { usePopupState } from 'material-ui-popup-state/hooks'
import { Observer } from 'mobx-react-lite'
import React from 'react'
import type User from 'stores/models/user'
import { authStore } from 'stores/ui/auth.store'
import UserAvatar from './UserAvatar'
import UserContentAbout from './UserContentAbout'
import UserName from './UserName'

type Props = {
  user?: User
  children: React.ReactNode
  disabled?: boolean
}

function UserPopover(props: Props) {
  const popupState = usePopupState({ variant: 'popover', popupId: 'user-popup' })
  const open = useDelayPopover(popupState)

  const me = authStore.currentUser

  const isMobile = useMobile()
  const { user, disabled = false } = props

  if (isMobile || disabled) {
    return props.children
  }

  return (
    <>
      <span {...bindHover(popupState)}>{props.children}</span>
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
            <Box sx={{ width: 340, maxHeight: 270, p: 2 }}>
              <Row sx={{ justifyContent: 'space-between' }}>
                <UserAvatar disabledPopover size={60} user={user} />
                {me?.following?.followsPubkey(user?.data.pubkey) ? (
                  <Button sx={{ minWidth: 95 }} variant='text' color='inherit'>
                    Following
                  </Button>
                ) : (
                  <Button sx={{ minWidth: 95 }} variant='contained' color='info'>
                    Follow
                  </Button>
                )}
              </Row>
              <UserName disablePopover user={user} sx={{ mt: 1 }} />
              <Box sx={{ lineHeight: '1.2' }}>
                <UserContentAbout user={user} />
              </Box>
            </Box>
          )}
        </Observer>
      </HoverPopover>
    </>
  )
}

export default UserPopover
