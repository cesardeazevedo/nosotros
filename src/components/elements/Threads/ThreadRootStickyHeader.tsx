import { PostOptions } from '@/components/elements/Posts/PostOptions'
import { PostUserHeader } from '@/components/elements/Posts/PostUserHeader'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useMobile } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo, useEffect, useRef, useState, type RefObject } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  event: NostrEventDB
  groupRef: RefObject<HTMLDivElement | null>
  rootRef: RefObject<HTMLDivElement | null>
}

export const ThreadRootStickyHeader = memo(function ThreadRootStickyHeader(props: Props) {
  const { event, groupRef, rootRef } = props
  const preview = (event.content || '').replace(/\s+/g, ' ').trim()
  const [fixed, setFixed] = useState(false)
  const [fixedRect, setFixedRect] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const rafRef = useRef<number | null>(null)
  const fixedRef = useRef(false)
  const rectRef = useRef({ left: 0, width: 0 })
  const isMobile = useMobile()

  useEffect(() => {
    const scrollContainer = groupRef.current?.closest('[data-feed-scroll="1"]') as HTMLElement | null

    const update = () => {
      const el = groupRef.current
      if (!el) {
        if (fixedRef.current) {
          fixedRef.current = false
          setFixed(false)
        }
        return
      }
      const rect = el.getBoundingClientRect()
      const shouldFix = rect.top <= 0 && rect.bottom > 72
      if (fixedRef.current !== shouldFix) {
        fixedRef.current = shouldFix
        setFixed(shouldFix)
      }
      if (shouldFix) {
        const nextLeft = Math.round(rect.left)
        const nextWidth = Math.round(rect.width)
        if (rectRef.current.left !== nextLeft || rectRef.current.width !== nextWidth) {
          rectRef.current = { left: nextLeft, width: nextWidth }
          setFixedRect(rectRef.current)
        }
      }
    }

    const scheduleUpdate = () => {
      if (rafRef.current !== null) {
        return
      }
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        update()
      })
    }

    scheduleUpdate()
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', scheduleUpdate, { passive: true })
    } else {
      window.addEventListener('scroll', scheduleUpdate, { passive: true })
    }
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', scheduleUpdate)
      } else {
        window.removeEventListener('scroll', scheduleUpdate)
      }
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [event.id, groupRef])

  if (!fixed) {
    return null
  }

  return (
    <Stack
      justify='space-between'
      sx={[styles.root, styles.root$fixed(fixedRect.left, fixedRect.width), isMobile && styles.root$mobile]}>
      <Stack
        grow
        sx={styles.header}
        onClick={() => rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
        <PostUserHeader
          event={event}
          dense
          renderNIP05={false}
          grow
          sx={styles.headerContent}
          userAvatarProps={{ size: 'md' }}
          footer={
            <Text variant='body' size='md' element={html.div} sx={styles.preview}>
              {preview || '...'}
            </Text>
          }
        />
      </Stack>
      <Stack sx={styles.options}>
        <PostOptions event={event} />
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    zIndex: 40,
    gap: spacing.padding1,
    marginInline: spacing.margin2,
    marginBottom: spacing.margin1,
    padding: 9.8,
    borderRadius: shape.md,
    backgroundColor: palette.surfaceContainerLowest,
    borderBottom: '1px solid',
    borderColor: palette.outlineVariant,
    overflow: 'hidden',
  },
  header: {
    cursor: 'pointer',
    minWidth: 0,
    flex: 1,
  },
  headerContent: {
    width: 'auto',
    height: 'auto',
    minWidth: 0,
  },
  options: {
    flexShrink: 0,
  },
  root$mobile: {
    top: 64,
  },
  root$fixed: (left: number, width: number) => ({
    position: 'fixed',
    top: 0,
    left,
    width,
    zIndex: 120,
    marginInline: 0,
    borderRadius: 0,
  }),
  preview: {
    width: '100%',
    minWidth: 0,
    display: 'block',
    color: palette.onSurfaceVariant,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})
