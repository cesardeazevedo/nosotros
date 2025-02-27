import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useMemo } from 'react'
import { css } from 'react-strict-dom'
import type { Props as PaperProps } from '../Paper/Paper'
import { Paper } from '../Paper/Paper'
import { Text } from '../Text/Text'

type Props = Omit<PaperProps, 'children'> & {
  value?: string | number
  maxValue?: number
  showZero?: boolean
  dot?: boolean
}

export const Badge = (props: Props) => {
  const { dot, value, maxValue = 99, showZero } = props
  const valueAsNumber = typeof value === 'number' ? Number(value) : undefined
  const invisible = (value === undefined && !dot) || (valueAsNumber !== undefined && valueAsNumber <= 0 && !showZero)
  const displayValue = useMemo(
    () =>
      dot
        ? null
        : valueAsNumber !== undefined
          ? maxValue !== undefined && valueAsNumber > maxValue
            ? `${maxValue}+`
            : Math.max(0, valueAsNumber)
          : value,
    [dot, value, maxValue, valueAsNumber],
  )
  return (
    <Paper sx={[styles.root, invisible && styles.root$invisible, dot && styles.root$dot]}>
      <Text sx={styles.label}>{displayValue}</Text>
    </Paper>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    minWidth: 16,
    height: 16,
    backgroundColor: palette.error,
    padding: spacing.padding1,
    transitionProperty: 'transform',
    transitionDuration: duration.short3,
    transitionTimingFunction: easing.standard,
    whiteSpace: 'nowrap',
  },
  root$dot: {
    transform: `scale(0.5)`,
    padding: 0,
  },
  root$invisible: {
    transform: 'scale(0)',
  },
  label: {
    position: 'relative',
    color: 'white',
  },
})
