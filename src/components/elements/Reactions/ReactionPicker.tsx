import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { useMobile } from '@/hooks/useMobile'
import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import React, { memo, useRef } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  mobileOpen: boolean
  onClose?: () => void
  onClick: (reaction: string) => void
  children: React.ReactNode
}

const reactions = {
  like: { title: 'Like', reaction: '🤙' },
  heart: { title: 'Heart', reaction: '❤️' },
  lfg: { title: 'LFG!', reaction: '🚀' },
  fire: { title: 'Fire', reaction: '🔥' },
  watching: { title: 'Watching', reaction: '👀' },
  haha: { title: 'Haha', reaction: '😂' },
  salute: { title: 'Salute', reaction: '🫡' },
  hugs: { title: 'Hugs', reaction: '🫂' },
  angry: { title: 'Angry', reaction: '😡' },
} as const

const ReactionIconMotion = (props: {
  reaction: keyof typeof reactions
  mouseX: MotionValue<number>
  onClick?: (emoji: string) => void
}) => {
  const { mouseX, onClick } = props
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

  const { title, reaction } = reactions[props.reaction]

  return (
    <motion.div
      ref={ref}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick?.(reaction)
      }}
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

const ReactionIcon = (props: { reaction: keyof typeof reactions; onClick?: (emoji: string) => void }) => {
  const { onClick } = props
  const { reaction } = reactions[props.reaction]

  return (
    <span
      {...css.props(styles.reaction$mobile)}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick?.(reaction)
      }}>
      {reaction}
    </span>
  )
}

const ReactionDockMobile = ({ onClick }: { onClick: Props['onClick'] }) => {
  const props = { onClick }
  return (
    <Stack sx={styles.dock$mobile}>
      <ReactionIcon {...props} reaction={'like'} />
      <ReactionIcon {...props} reaction={'heart'} />
      <ReactionIcon {...props} reaction={'lfg'} />
      <ReactionIcon {...props} reaction={'fire'} />
      <ReactionIcon {...props} reaction={'watching'} />
      <ReactionIcon {...props} reaction={'haha'} />
      <ReactionIcon {...props} reaction={'salute'} />
      <ReactionIcon {...props} reaction={'hugs'} />
      <ReactionIcon {...props} reaction={'angry'} />
    </Stack>
  )
}

const ReactionDockMotion = ({ onClick }: { onClick: Props['onClick'] }) => {
  const mouseX = useMotionValue(250)
  const props = { mouseX, onClick }
  return (
    <div {...css.props(styles.dock)} onMouseMove={(e) => mouseX.set(e.pageX)}>
      <ReactionIconMotion reaction='like' {...props} />
      <ReactionIconMotion reaction='heart' {...props} />
      <ReactionIconMotion reaction='lfg' {...props} />
      <ReactionIconMotion reaction='fire' {...props} />
      <ReactionIconMotion reaction='watching' {...props} />
      <ReactionIconMotion reaction='haha' {...props} />
      <ReactionIconMotion reaction='salute' {...props} />
      <ReactionIconMotion reaction='hugs' {...props} />
      <ReactionIconMotion reaction='angry' {...props} />
    </div>
  )
}

export const ReactionPicker = memo(function ReactionPicker(props: Props) {
  const { mobileOpen, children, onClick, onClose } = props
  const mobile = useMobile()

  if (mobile && mobileOpen) {
    return (
      <PopoverBase
        opened
        cursor={false}
        placement='top-start'
        role='tooltip'
        forwardProps
        onClose={() => onClose?.()}
        contentRenderer={(content) => (
          <ReactionDockMobile
            onClick={(e) => {
              content.close()
              onClick(e)
            }}
          />
        )}>
        {(content) => (
          <span {...content.getProps()} ref={content.setRef}>
            {children}
          </span>
        )}
      </PopoverBase>
    )
  }

  return (
    <TooltipRich
      keepMounted
      cursor={false}
      placement='top-start'
      enterDelay={500}
      content={(props) => (
        <ReactionDockMotion
          onClick={(e) => {
            props.close()
            onClick(e)
          }}
        />
      )}>
      {children}
    </TooltipRich>
  )
})

const styles = css.create({
  dock: {
    borderRadius: shape.full,
    width: 420,
    height: 50,
    fontSize: 28,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 12,
    backgroundColor: palette.surfaceContainerLowest,
    boxShadow: elevation.shadows4,
  },
  dock$mobile: {
    width: 390,
    minHeight: 50,
    display: 'flex',
    flexDirection: 'row',
    fontSize: 24,
    boxShadow: elevation.shadows4,
    backgroundColor: palette.surfaceContainerLowest,
    borderRadius: shape.xl,
    paddingInline: spacing.padding1,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  reaction: {
    position: 'relative',
    userSelect: 'none',
    cursor: 'pointer',
  },
  reaction$mobile: {
    padding: 16,
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
