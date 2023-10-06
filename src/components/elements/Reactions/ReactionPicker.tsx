import { Box, Theme } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'
import { MotionValue, motion, useMotionValue, useTransform } from 'framer-motion'
import { useDelayPopover } from 'hooks/useDelayPopover'
import HoverPopover from 'material-ui-popup-state/HoverPopover'
import { bindHover, bindPopover, usePopupState } from 'material-ui-popup-state/hooks'
import React, { useRef } from 'react'

type Props = {
  children: React.ReactNode
}

function ReactionIcon(props: { title: string; emoji: string; mouseX: MotionValue<number> }) {
  const { emoji, title, mouseX } = props
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

function ReactionDock() {
  const mouseX = useMotionValue(0)
  return (
    <Row
      sx={{ width: 340, height: 50, fontSize: 28, justifyContent: 'center', div: { mr: 2 } }}
      onMouseMove={(e) => mouseX.set(e.pageX)}>
      <ReactionIcon title='Like' emoji='🤙' mouseX={mouseX} />
      <ReactionIcon title='Love' emoji='❤️' mouseX={mouseX} />
      <ReactionIcon title='Haha' emoji='😂' mouseX={mouseX} />
      <ReactionIcon title='Salute' emoji='🫡' mouseX={mouseX} />
      <ReactionIcon title='Wow' emoji='😮' mouseX={mouseX} />
      <ReactionIcon title='Sad' emoji='😭' mouseX={mouseX} />
      <ReactionIcon title='Angry' emoji='😡' mouseX={mouseX} />
    </Row>
  )
}

function ReactionPicker(props: Props) {
  const popupState = usePopupState({ variant: 'popover', popupId: 'reaction-popup' })
  const open = useDelayPopover(popupState, 800)

  return (
    <>
      <Box {...bindHover(popupState)} component='span'>
        {props.children}
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
        <ReactionDock />
      </HoverPopover>
    </>
  )
}

export default ReactionPicker
