import { Button } from '@/components/ui/Button/Button'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { spacing } from '@/themes/spacing.stylex'
import { useMobile } from 'hooks/useMobile'
import { Observer } from 'mobx-react-lite'
import React from 'react'
import { css } from 'react-strict-dom'
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
  const me = authStore.currentUser

  const isMobile = useMobile()
  const { user, disabled = false } = props

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
            <Paper outlined shape='lg' surface='surfaceContainerLowest' sx={styles.root}>
              <Stack justify='space-between'>
                <UserAvatar disabledPopover size='md' user={user} />
                {me?.following?.followsPubkey(user?.data.pubkey) ? (
                  <Button variant='outlined'>Following</Button>
                ) : (
                  <Button variant='filled'>Follow</Button>
                )}
              </Stack>
              <br />
              <Stack horizontal={false} gap={1}>
                <UserName disablePopover user={user} />
                <UserContentAbout user={user} />
              </Stack>
            </Paper>
          )}
        </Observer>
      }>
      <span>{props.children}</span>
    </TooltipRich>
  )
}

const styles = css.create({
  root: {
    width: 340,
    maxHeight: 270,
    padding: spacing.padding2,
    pointerEvents: 'auto',
  },
})

export default UserPopover
