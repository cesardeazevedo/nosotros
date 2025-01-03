import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { useTheme } from '@/hooks/useTheme'
import type { Note } from '@/stores/notes/note'
import { zapStore } from '@/stores/zaps/zaps.store'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconBolt } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { ButtonContainer, type ContainerProps } from './PostButtonContainer'
import { iconProps } from './utils'

type Props = {
  note: Note
  dense?: boolean
  onClick?: () => void
}

const themes = {
  light: [colors.violet10, colors.violet10, colors.violet9, colors.violet8, colors.violet7, colors.violet6],
  dark: [colors.violet1, colors.violet2, colors.violet3, colors.violet4, colors.violet5, colors.violet6],
} as const

function getZapColor(zapAmount: number, palette: (typeof themes)['light'] | (typeof themes)['dark']): string {
  if (zapAmount < 1000) {
    return palette[0]
  } else if (zapAmount >= 1000 && zapAmount < 5000) {
    return palette[1]
  } else if (zapAmount >= 5000 && zapAmount < 10000) {
    return palette[2]
  } else if (zapAmount >= 10000 && zapAmount < 50000) {
    return palette[3]
  } else if (zapAmount >= 50000 && zapAmount < 100000) {
    return palette[4]
  } else {
    return palette[5]
  }
}

const formatter = new Intl.NumberFormat()

export const ButtonZap = observer(function ButtonZap(props: Props & ContainerProps) {
  const { dense, onClick, note, ...rest } = props
  const globalSettings = useGlobalSettings()
  const theme = useTheme(globalSettings.theme)
  const total = zapStore.getTotal(note.id) || ''
  const palette = themes[theme.key as 'light' | 'dark']
  return (
    <ButtonContainer
      {...rest}
      active={false}
      sx={styles[getZapColor(total || 0, palette)]}
      value={<>{total ? formatter.format(total) : ''}</>}>
      <Tooltip cursor='arrow' text='Send a Zap (coming soon)'>
        <IconButton
          size={dense ? 'sm' : 'md'}
          onClick={onClick}
          icon={
            <IconBolt size={dense ? iconProps.size$dense : iconProps.size} strokeWidth={iconProps.strokeWidth} />
          }></IconButton>
      </Tooltip>
    </ButtonContainer>
  )
})

const styles = css.create({
  [colors.violet0]: { color: colors.violet0 },
  [colors.violet1]: { color: colors.violet1 },
  [colors.violet2]: { color: colors.violet2 },
  [colors.violet3]: { color: colors.violet3 },
  [colors.violet4]: { color: colors.violet4 },
  [colors.violet5]: { color: colors.violet5 },
  [colors.violet6]: { color: colors.violet6 },
  [colors.violet7]: { color: colors.violet7 },
  [colors.violet8]: { color: colors.violet8 },
  [colors.violet9]: { color: colors.violet9 },
  [colors.violet10]: { color: colors.violet10 },
  [colors.violet11]: { color: colors.violet11 },
  [colors.violet12]: { color: colors.violet12 },
})
