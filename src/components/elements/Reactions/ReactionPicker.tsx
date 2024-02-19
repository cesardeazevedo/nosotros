import { Box, type Theme } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import { useDelayPopover } from 'hooks/useDelayPopover'
import HoverPopover from 'material-ui-popup-state/HoverPopover'
import { bindHover, bindPopover, usePopupState } from 'material-ui-popup-state/hooks'
import React, { useCallback, useRef } from 'react'

type Props = {
  onClick: (emoji: string) => void
  children: React.ReactNode
}

function ReactionIcon(props: {
  title: string
  emoji: string
  mouseX: MotionValue<number>
  onClick?: (emoji: string) => void
}) {
  const { emoji, title, mouseX, onClick } = props
  const ref = useRef<HTMLDivElement | null>(null)
  const distance = useTransform(mouseX, (value: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return value - bounds.x - bounds.width / 2
  })
  const scale = useTransform(distance, [-50, 0, 50], [0.8, 1.8, 0.8])
  const marginRight = useTransform(distance, [-100, 0, 100], [12, 38, 12])
  const rotateZ = useTransform(distance, [-100, 0, 100], [0, -8, 0])
  const rotateZText = useTransform(distance, [-100, 0, 100], [0, 16, 0])
  const opacity = useTransform(distance, [-50, 0, 50], [0, 1, 0])

  return (
    <motion.div
      ref={ref}
      onClick={() => onClick?.(emoji)}
      style={{ position: 'relative', scale, marginRight, rotateZ, userSelect: 'none', cursor: 'pointer' }}>
      <motion.div
        style={{
          position: 'absolute',
          backgroundColor: '#000',
          color: '#fff',
          paddingLeft: 12,
          paddingRight: 12,
          borderRadius: 24,
          rotateZ: rotateZText,
          top: -30,
          left: -25,
          scale: 0.28,
          fontWeight: 600,
          opacity,
        }}>
        {title}
      </motion.div>
      <Box component='span'>{emoji}</Box>
    </motion.div>
  )
}

function ReactionDock({ onClick }: { onClick: Props['onClick'] }) {
  const mouseX = useMotionValue(0)
  const props = { mouseX, onClick }
  return (
    <Row
      sx={{ width: 340, height: 50, fontSize: 28, justifyContent: 'center', div: { mr: 2 } }}
      onMouseMove={(e) => mouseX.set(e.pageX)}>
      <ReactionIcon title='Like' emoji='🤙' {...props} />
      <ReactionIcon title='Love' emoji='❤️' {...props} />
      <ReactionIcon title='Haha' emoji='😂' {...props} />
      <ReactionIcon title='Salute' emoji='🫡' {...props} />
      <ReactionIcon title='Wow' emoji='😮' {...props} />
      <ReactionIcon title='Sad' emoji='😭' {...props} />
      <ReactionIcon title='Angry' emoji='😡' {...props} />
    </Row>
  )
}

function ReactionPicker(props: Props) {
  const { children, onClick } = props
  const popupState = usePopupState({ variant: 'popover', popupId: 'reaction-popup' })
  const open = useDelayPopover(popupState, 800)

  const handleClick = useCallback(
    (emoji: string) => {
      popupState.setOpen(false)
      onClick(emoji)
    },
    [onClick, popupState],
  )

  return (
    <>
      <Box {...bindHover(popupState)} component='span'>
        {children}
      </Box>
      <HoverPopover
        {...bindPopover(popupState)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 10,
              pointerEvents: 'auto',
              overflow: 'visible',
              backgroundColor: (theme) => `rgba(${(theme as Theme).palette.common.backgroundChannel} / 0.80)`,
              backdropFilter: 'blur(4px)',
            },
          },
        }}
        TransitionProps={{ in: open }}
        transitionDuration={{ enter: 200, exit: 200 }}
        transformOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}>
        <ReactionDock onClick={handleClick} />
      </HoverPopover>
    </>
  )
}

export default ReactionPicker
