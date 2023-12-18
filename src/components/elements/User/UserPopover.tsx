import { Avatar, Box, Button, Theme } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'
import { bindHover, bindPopover } from 'material-ui-popup-state'
import { usePopupState } from 'material-ui-popup-state/hooks'
import React from 'react'

import { useDelayPopover } from 'hooks/useDelayPopover'
import { useMobile } from 'hooks/useMobile'
import HoverPopover from 'material-ui-popup-state/HoverPopover'
import { Observer } from 'mobx-react-lite'
import { useStore } from 'stores'
import { User } from 'stores/modules/user.store'
import TextContent from '../Texts/TextContent'
import UserName from './UserName'

type Props = {
  user?: User
  children: React.ReactNode
  disabled?: boolean
}

function UserPopover(props: Props) {
  const popupState = usePopupState({ variant: 'popover', popupId: 'user-popup' })
  const open = useDelayPopover(popupState)
  const store = useStore()

  const isMobile = useMobile()
  const { user, disabled = false } = props

  if (isMobile || disabled) {
    // We are disabling this component on mobile, in the future we want to do a lot more sophisticated,
    // but for now, it will just cause annoying problems.
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
            <Box sx={{ width: 300, maxHeight: 270, p: 2 }}>
              <Row sx={{ justifyContent: 'space-between' }}>
                <Avatar src={user?.metadata.picture} sx={{ width: 60, height: 60 }}>
                  {user?.initial}
                </Avatar>
                {store.contacts.isFollowing(user?.id) ? (
                  <Button sx={{ minWidth: 95 }} variant='text' color='inherit'>
                    Following
                  </Button>
                ) : (
                  <Button sx={{ minWidth: 95 }} variant='contained' color='info'>
                    Follow
                  </Button>
                )}
              </Row>
              <UserName disablePopover user={user} />
              <Box sx={{ mt: 1 }}>
                {user?.metadata?.aboutParsed?.map((token, index) => (
                  <TextContent dense key={token.kind + index} token={token} />
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
