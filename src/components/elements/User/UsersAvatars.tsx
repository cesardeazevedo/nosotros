import { ContentProvider } from '@/components/providers/ContentProvider'
import { ButtonBase } from '@/components/ui/ButtonBase/ButtonBase'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { dedupe } from '@/core/helpers/dedupe'
import { userStore } from '@/stores/users/users.store'
import type { ColorPalette } from '@/themes/palette.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { ReactNode } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { UserAvatar } from './UserAvatar'

type Props = {
  pubkeys: string[]
  max?: number
  description?: ReactNode
  renderTooltip?: boolean
  onPrimary?: boolean
  borderColor?: keyof ColorPalette
}

export const UsersAvatars = observer(function UserAvatars(props: Props) {
  const { pubkeys, max = 3, description, borderColor, renderTooltip = true } = props
  const usersSet = new Set(userStore.users.keys())
  const pubkeysSet = new Set(pubkeys)
  const existingUsersSet = usersSet.intersection(pubkeysSet)
  const topUsers = dedupe([...existingUsersSet, ...pubkeys]).slice(0, max)
  return (
    <Stack justify='flex-end' gap={0.5} sx={styles.root}>
      {renderTooltip && pubkeys.length > 3 && (
        <TooltipRich
          openEvents={{ click: true, hover: false }}
          content={() => (
            <Paper elevation={2} surface='surfaceContainerLow' sx={styles.tooltip}>
              {description}
              <Stack wrap sx={styles.wrapper}>
                {pubkeys.map((pubkey) => (
                  <UserAvatar key={pubkey} sx={styles.avatar2} size='xs' pubkey={pubkey} />
                ))}
              </Stack>
            </Paper>
          )}>
          <ButtonBase sx={styles.more}>
            <Text variant='body' size='sm'>
              {pubkeys.length}
            </Text>
          </ButtonBase>
        </TooltipRich>
      )}
      <Stack>
        <ContentProvider value={{ disableLink: true, disablePopover: true }}>
          {topUsers.map((pubkey) => (
            <UserAvatar
              key={pubkey}
              sx={[styles.avatar, borderColor ? styles.avatarBorderColor(borderColor) : null]}
              size='xs'
              pubkey={pubkey}
            />
          ))}
        </ContentProvider>
      </Stack>
    </Stack>
  )
})

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
})
