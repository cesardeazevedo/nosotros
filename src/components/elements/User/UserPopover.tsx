import { FollowButton } from '@/components/modules/Follows/FollowButton'
import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { spacing } from '@/themes/spacing.stylex'
import { useMobile } from 'hooks/useMobile'
import { Observer } from 'mobx-react-lite'
import React from 'react'
import { css, html } from 'react-strict-dom'
import { UserAvatar } from './UserAvatar'
import { UserContentAbout } from './UserContentAbout'
import { UserName } from './UserName'
import { UserNIP05 } from './UserNIP05'
import { UserRelays } from './UserRelays'

type Props = {
  pubkey: string
  children: React.ReactNode
  disabled?: boolean
}

export const UserPopover = function UserPopover(props: Props) {
  const isMobile = useMobile()
  const { pubkey } = props
  const { disablePopover } = useContentContext()

  if (isMobile || disablePopover) {
    return props.children
  }

  return (
    <TooltipRich
      enterDelay={500}
      placement='bottom-start'
      cursor='dot'
      content={() => (
        <Observer>
          {() => (
            <ContentProvider value={{ disablePopover: true }}>
              <Paper elevation={4} shape='lg' surface='surfaceContainerLow' sx={styles.root}>
                <Stack justify='space-between' sx={styles.header}>
                  <UserAvatar size='lg' pubkey={pubkey} />
                  <Stack gap={0.5}>
                    <UserRelays pubkey={pubkey} />
                    <FollowButton pubkey={pubkey} />
                  </Stack>
                </Stack>
                <br />
                <Stack horizontal={false} gap={2}>
                  <Stack horizontal={false} sx={styles.content}>
                    <UserName pubkey={pubkey} />
                    <UserNIP05 pubkey={pubkey} />
                  </Stack>
                  <html.span style={styles.scroller}>
                    <UserContentAbout pubkey={pubkey} />
                  </html.span>
                </Stack>
              </Paper>
            </ContentProvider>
          )}
        </Observer>
      )}>
      {props.children}
    </TooltipRich>
  )
}

const styles = css.create({
  root: {
    width: 300,
    maxHeight: 450,
    pointerEvents: 'auto',
  },
  header: {
    padding: spacing.padding1,
  },
  content: {
    paddingInline: spacing.padding2,
  },
  scroller: {
    maxHeight: 300,
    overflowY: 'auto',
    paddingBottom: spacing.padding1,
    paddingInline: spacing.padding2,
  },
})
