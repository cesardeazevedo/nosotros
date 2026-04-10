import { ContentProvider } from '@/components/providers/ContentProvider'
import { ButtonBase } from '@/components/ui/ButtonBase/ButtonBase'
import { Paper } from '@/components/ui/Paper/Paper'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import type { ColorPalette } from '@/themes/palette.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { type ReactNode } from 'react'
import { css } from 'react-strict-dom'
import { UserAvatar } from './UserAvatar'

type Props = {
  max?: number
  pubkeys: string[]
  description?: ReactNode
  renderTooltip?: boolean
  onPrimary?: boolean
  borderColor?: keyof ColorPalette
  sx?: SxProps
}

export const UsersAvatars = function UserAvatars(props: Props) {
  const { pubkeys, max = 3, description, borderColor, renderTooltip = true, sx } = props
  const topUsers = pubkeys.slice(0, max)
  const popoverUsers = pubkeys.slice(0, 100)
  const remainingUsers = Math.max(0, pubkeys.length - popoverUsers.length)
  return (
    <Stack justify='center' gap={0.5} sx={[styles.root, sx]}>
      {renderTooltip && (
        <Popover
          placement='bottom-start'
          contentRenderer={() => (
            <Paper elevation={2} surface='surfaceContainerLow' sx={styles.tooltip}>
              {description}
              <Stack wrap sx={styles.wrapper}>
                {popoverUsers.map((pubkey, index) => (
                  <UserAvatar key={pubkey + index} sx={styles.avatar2} size='xs' pubkey={pubkey} />
                ))}
                {remainingUsers > 0 && (
                  <Text variant='label' size='sm' sx={styles.remainingInline}>
                    +{remainingUsers} users
                  </Text>
                )}
              </Stack>
            </Paper>
          )}>
          {({ open, getProps, setRef }) => (
            <ButtonBase {...getProps()} ref={setRef} onClick={(e) => {
              e.stopPropagation()
              open()
            }} sx={styles.more}>
              <Text variant='body' size='sm'>
                {pubkeys.length}
              </Text>
            </ButtonBase>
          )}
        </Popover>
      )}
      <ContentProvider value={{ disableLink: true, disablePopover: true }}>
        {topUsers.map((pubkey, index) => (
          <UserAvatar
            key={pubkey + index}
            sx={[styles.avatar, borderColor ? styles.avatarBorderColor(borderColor) : null]}
            size='xs'
            pubkey={pubkey}
          />
        ))}
      </ContentProvider>
    </Stack>
  )
}

const styles = css.create({
  root: {
    marginLeft: 8,
  },
  avatar: {
    marginLeft: -8,
    boxShadow: `0px 0px 0px 2px `,
    color: palette.surfaceContainerLowest,
  },
  avatarBorderColor: (color: keyof ColorPalette) => ({ color: palette[color] }),
  avatar2: {
    marginLeft: -6,
    border: '2px solid',
    borderColor: palette.surfaceContainerLowest,
  },
  more: {
    left: -8,
    backgroundColor: palette.surfaceContainer,
    borderRadius: shape.xs,
    paddingInline: 4,
    paddingBlock: 2,
    fontWeight: 500,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '80%',
    textAlign: 'center',
    minWidth: 20,
  },
  tooltip: {
    padding: spacing.padding1,
    maxWidth: 356,
  },
  wrapper: {
    padding: spacing.padding1,
    marginTop: spacing.margin1,
    maxHeight: 240,
    overflowY: 'auto',
  },
  remainingInline: {
    paddingInline: spacing['padding0.5'],
    paddingBlock: spacing['padding0.5'],
    color: palette.onSurfaceVariant,
    borderRadius: shape.xs,
    backgroundColor: palette.surfaceContainer,
    marginLeft: spacing['margin0.5'],
  },
})
