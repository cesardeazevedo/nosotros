import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { useMobile } from '@/hooks/useMobile'
import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import React, { memo, useState } from 'react'
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

const reactionKeys = Object.keys(reactions) as Array<keyof typeof reactions>

const ReactionIconDesktop = (props: {
  reaction: keyof typeof reactions
  onClick?: (emoji: string) => void
  onHover?: () => void
  onLeave?: () => void
  style: React.CSSProperties
  titleStyle: React.CSSProperties
}) => {
  const { onClick } = props
  const { title, reaction } = reactions[props.reaction]

  return (
    <div
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick?.(reaction)
      }}
      onMouseEnter={props.onHover}
      onMouseLeave={props.onLeave}
      {...css.props(styles.reaction)}
      style={props.style}>
      {title && (
        <div {...css.props(styles.title)} style={props.titleStyle}>
          {title}
        </div>
      )}
      <span>{reaction}</span>
    </div>
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
  const [hovered, setHovered] = useState<keyof typeof reactions | null>(null)

  return (
    <div {...css.props(styles.dock)}>
      {reactionKeys.map((reactionKey) => {
        const isHovered = hovered === reactionKey

        return (
          <ReactionIconDesktop
            key={reactionKey}
            reaction={reactionKey}
            onClick={onClick}
            onHover={() => setHovered(reactionKey)}
            onLeave={() => setHovered(null)}
            style={{
              transform: isHovered ? 'scale(1.6) rotate(-6deg)' : 'scale(0.9)',
              marginRight: isHovered ? 32 : 12,
            }}
            titleStyle={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'rotate(16deg) scale(0.28)' : 'rotate(0deg) scale(0.28)',
            }}
          />
        )
      })}
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
    transition: 'transform 70ms linear, margin-right 70ms linear',
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
    transformOrigin: 'center',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    transition: 'opacity 70ms linear, transform 70ms linear',
  },
})
