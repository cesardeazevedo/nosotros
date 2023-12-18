import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Row } from 'components/elements/Layouts/Flex'
import React from 'react'

export interface ContainerProps {
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
        width: dense ? 'auto' : 28,
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
      button: {
        width: 34,
        height: 34,
        transition: 'scale 0.1s ease',
        '&:active': {
          scale: '1.1',
        },
      },
      '&:hover': {
        svg: {
          stroke: color,
        },
      },
    }),
)

function ButtonContainer(props: Props & ContainerProps) {
  const { value, children, ...rest } = props
  return (
    <Container {...rest}>
      {children}
      <Typography variant='subtitle1'>{value || ''}</Typography>
    </Container>
  )
}

export default ButtonContainer
