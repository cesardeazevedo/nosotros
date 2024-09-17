import { forwardRef } from 'react'
import { css } from 'react-strict-dom'
import { dialogTokens } from '../Dialog/Dialog.stylex'
import type { Props as PaperProps } from '../Paper/Paper'
import { Paper } from '../Paper/Paper'
import type { SxProps } from '../types'

export type Props = PaperProps & {
  sx?: SxProps
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

export const DialogContent = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, maxWidth = 'md', ...rest } = props
  return (
    <Paper ref={ref} {...rest} shape='lg' sx={[styles.content, styles[`content$${maxWidth}`], rest.sx]}>
      {children}
    </Paper>
  )
})

const MOBILE = '@media (max-width: 599.95px)'

const styles = css.create({
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    flex: 1,
    width: '100vw',
    maxHeight: {
      default: 'calc(100% - 64px)',
      [MOBILE]: '100%',
    },
    borderRadius: {
      default: dialogTokens.containerShape,
      [MOBILE]: 0,
    },
  },
  content$xs: {
    maxWidth: {
      default: 400,
      [MOBILE]: '100%',
    },
  },
  content$sm: {
    maxWidth: {
      default: 600,
      [MOBILE]: '100%',
    },
  },
  content$md: {
    maxWidth: {
      default: 900,
      [MOBILE]: '100%',
    },
  },
  content$lg: {
    maxWidth: {
      default: 1200,
      [MOBILE]: '100%',
    },
  },
})
