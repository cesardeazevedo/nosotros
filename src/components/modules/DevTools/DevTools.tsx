import { devtoolsSubscriptionGroupsAtom } from '@/atoms/devtools.atoms'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconX } from '@tabler/icons-react'
import { useAtomValue } from 'jotai'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { DevToolsSubscriptionDetails } from './DevToolsSubscriptionDetails'
import { DevToolsSubscriptions } from './DevToolsSubscriptions'

const MIN_HEIGHT = 140
const COLLAPSED_HEIGHT = 57

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const DevTools = memo(function DevTools() {
  const subscriptions = useAtomValue(devtoolsSubscriptionGroupsAtom)
  const [open, setOpen] = useState(false)
  const [height, setHeight] = useState(260)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const dragStartRef = useRef<{ y: number; height: number } | null>(null)
  const didDragRef = useRef(false)

  const panelHeight = open ? height : COLLAPSED_HEIGHT
  const selected = subscriptions.find((entry) => entry.id === selectedGroupId) || subscriptions[0] || null

  const onDragMove = useCallback(
    (event: MouseEvent) => {
      const start = dragStartRef.current
      if (!start) {
        return
      }
      if (Math.abs(event.clientY - start.y) > 2) {
        didDragRef.current = true
      }
      const next = clamp(start.height + (start.y - event.clientY), MIN_HEIGHT, Number.POSITIVE_INFINITY)
      setHeight(next)
    },
    [didDragRef, dragStartRef],
  )

  const onDragEnd = useCallback(() => {
    dragStartRef.current = null
    window.removeEventListener('mousemove', onDragMove)
    window.removeEventListener('mouseup', onDragEnd)
  }, [dragStartRef, onDragMove])

  const onDragStart = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      didDragRef.current = false
      const startHeight = open ? height : COLLAPSED_HEIGHT
      if (!open) {
        setHeight(startHeight)
        setOpen(true)
      }
      dragStartRef.current = { y: event.clientY, height: startHeight }
      window.addEventListener('mousemove', onDragMove)
      window.addEventListener('mouseup', onDragEnd)
    },
    [didDragRef, dragStartRef, height, onDragEnd, onDragMove, open],
  )

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', onDragMove)
      window.removeEventListener('mouseup', onDragEnd)
    }
  }, [onDragEnd, onDragMove])

  return (
    <Stack horizontal={false} sx={styles.root(panelHeight)}>
      <html.div
        style={styles.header}
        onClick={() => {
          if (didDragRef.current) {
            didDragRef.current = false
            return
          }
          if (!open) {
            setOpen(true)
          }
        }}>
        <html.div style={styles.dragHandle} onMouseDown={onDragStart} />
        <Stack justify='space-between' sx={styles.headerInner}>
          <Text size='lg' sx={styles.toggleLabel}>
            DevTools ({subscriptions.length})
          </Text>
          {open && (
            <IconButton
              icon={<IconX size={20} strokeWidth='2.2' />}
              sx={styles.closeIconButton}
              aria-label='Close devtools'
              onClick={(event) => {
                event.stopPropagation()
                setOpen(false)
              }}
            />
          )}
        </Stack>
      </html.div>
      {open && (
        <Stack sx={styles.content} align='flex-start'>
          <DevToolsSubscriptions
            subscriptions={subscriptions}
            selectedGroupId={selectedGroupId}
            onSelectGroup={setSelectedGroupId}
          />
          <DevToolsSubscriptionDetails selected={selected} />
        </Stack>
      )}
    </Stack>
  )
})

const styles = css.create({
  root: (height: number) => ({
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    height,
    zIndex: 120,
    backgroundColor: palette.surfaceContainerLowest,
    borderTopStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: palette.outlineVariant,
  }),
  header: {
    position: 'relative',
    minHeight: COLLAPSED_HEIGHT,
    padding: spacing.padding2,
    paddingInline: spacing.padding4,
    borderBottom: '1px solid',
    borderColor: palette.outlineVariant,
  },
  dragHandle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    cursor: 'ns-resize',
  },
  headerInner: {
    width: '100%',
  },
  toggleLabel: {
    fontWeight: 700,
  },
  closeIconButton: {},
  content: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
})
