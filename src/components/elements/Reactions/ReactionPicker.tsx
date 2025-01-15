import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import React, { memo, useRef } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  onClick: (reaction: string) => void
  children: React.ReactNode
}

function ReactionIcon(props: {
  title?: string
  reaction: string
  mouseX: MotionValue<number>
  onClick?: (emoji: string) => void
}) {
  const { reaction, title, mouseX, onClick } = props
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
      onClick={() => onClick?.(reaction)}
      {...css.props(styles.reaction)}
      style={{ scale, marginRight, rotateZ }}>
      {title && (
        <motion.div {...css.props(styles.title)} style={{ rotateZ: rotateZText, opacity }}>
          {title}
        </motion.div>
      )}
      <span>{reaction}</span>
    </motion.div>
  )
}

function ReactionDock({ onClick }: { onClick: Props['onClick'] }) {
  const mouseX = useMotionValue(250)
  const props = { mouseX, onClick }
  return (
    <div {...css.props(styles.dock)} onMouseMove={(e) => mouseX.set(e.pageX)}>
      <ReactionIcon title='Like' reaction='🤙' {...props} />
      <ReactionIcon title={`Let's go`} reaction='🚀' {...props} />
      <ReactionIcon title='Fire' reaction='🔥' {...props} />
      <ReactionIcon title='Watching' reaction='👀' {...props} />
      <ReactionIcon title='Haha' reaction='😂' {...props} />
      <ReactionIcon title='Salute' reaction='🫡' {...props} />
      {/* <ReactionIcon title='Hugs' reaction='🫂' {...props} /> */}
      {/* <ReactionIcon title='Wow' reaction='😮' {...props} /> */}
      {/* <ReactionIcon title='Sad' reaction='😭' {...props} /> */}
      <ReactionIcon title='Angry' reaction='😡' {...props} />
    </div>
  )
}

export const ReactionPicker = memo(function ReactionPicker(props: Props) {
  const { children, onClick } = props

  return (
    <TooltipRich cursor={false} placement='top-start' content={() => <ReactionDock onClick={onClick} />}>
      {children}
    </TooltipRich>
  )
})

const styles = css.create({
  dock: {
    borderRadius: shape.full,
    width: 340,
    height: 50,
    fontSize: 28,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 12,
    backgroundColor: palette.surfaceContainerLowest,
    boxShadow: elevation.shadows4,
  },
  reaction: {
    position: 'relative',
    userSelect: 'none',
    cursor: 'pointer',
  },
  title: {
    position: 'absolute',
    backgroundColor: '#000',
    color: '#fff',
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 24,
    top: -30,
    left: -25,
    scale: 0.28,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
})
