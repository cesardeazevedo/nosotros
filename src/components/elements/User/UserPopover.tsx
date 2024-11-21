import { Button } from '@/components/ui/Button/Button'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { useNostrClientContext } from '@/hooks/useNostrClientContext'
import { spacing } from '@/themes/spacing.stylex'
import { useMobile } from 'hooks/useMobile'
import { Observer } from 'mobx-react-lite'
import React from 'react'
import { css, html } from 'react-strict-dom'
import type { User } from 'stores/models/user'
import { UserAvatar } from './UserAvatar'
import { UserContentAbout } from './UserContentAbout'
import { UserName } from './UserName'
import { UserNIP05 } from './UserNIP05'

type Props = {
  user?: User
  children: React.ReactNode
  disabled?: boolean
}

export const UserPopover = (props: Props) => {
  const isMobile = useMobile()
  const { user, disabled = false } = props
  const { user: currentUser } = useNostrClientContext()

  if (isMobile || disabled) {
    return props.children
  }

  return (
    <TooltipRich
      enterDelay={500}
      placement='bottom-start'
      cursor='dot'
      content={
        <Observer>
          {() => (
            <Paper elevation={2} shape='lg' surface='surfaceContainerLow' sx={styles.root}>
              <Stack justify='space-between'>
                <UserAvatar disabledPopover size='lg' pubkey={user?.pubkey} />
                {currentUser?.following?.followsPubkey(user?.pubkey) ? (
                  <Button variant='outlined'>Following</Button>
                ) : (
                  <Button variant='filled'>Follow</Button>
                )}
              </Stack>
              <br />
              <Stack horizontal={false} gap={2}>
                <Stack horizontal={false}>
                  <UserName disablePopover pubkey={user?.pubkey} />
                  <UserNIP05 pubkey={user?.pubkey} hideForFollowing={false} />
                </Stack>
                <html.span style={styles.scroller}>
                  <UserContentAbout user={user} />
                </html.span>
              </Stack>
            </Paper>
          )}
        </Observer>
      }>
      {props.children}
    </TooltipRich>
  )
}

const styles = css.create({
  root: {
    width: 360,
    maxHeight: 290,
    padding: spacing.padding2,
    pointerEvents: 'auto',
  },
  scroller: {
    maxHeight: 135,
    overflowY: 'auto',
  },
})
