import { Typography } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import { Row } from 'components/elements/Layouts/Flex'
import { motion } from 'framer-motion'
import React from 'react'

export type ContainerProps = {
  value?: number | false | React.ReactElement
  color?: string
  active?: boolean
  dense?: boolean
  animate?: boolean
}

type Props = {
  children: React.ReactNode
  onClick?: (e?: unknown) => void
}

const shouldForwardProp = (prop: string) => prop !== 'active' && prop !== 'dense'

const Container = styled(Row, { shouldForwardProp })<ContainerProps>(
  ({ dense = false, active = false, theme, color = theme.palette.text.secondary }) =>
    theme.unstable_sx({
      cursor: 'pointer',
      h6: {
        ml: 1,
        fontWeight: 500,
        color: active ? color : theme.vars.palette.text.secondary,
      },
      svg: {
        width: dense ? 20 : 24,
        height: dense ? 20 : 24,
        ...(active && {
          svg: {
            fill: color,
            stroke: color,
          },
        }),
      },
      '&:hover': {
        '> *': {
          transition: 'all 0.08s ease',
        },
        button: {
          backgroundColor: alpha(color, 0.08),
        },
        svg: {
          stroke: color,
        },
        h6: {
          color: color,
        },
      },
    }),
)

function ButtonContainer(props: Props & ContainerProps) {
  const { value, children, animate = true, ...rest } = props
  return (
    <Container {...rest}>
      {animate ? <motion.span whileTap={{ scale: 1.2 }}>{children}</motion.span> : children}
      {value !== 0 && <Typography variant='subtitle1'>{value}</Typography>}
    </Container>
  )
}

export default ButtonContainer
