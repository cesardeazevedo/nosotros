import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { memo, type DragEvent, type ReactNode, useRef, useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  children: ReactNode
  onFilesDrop: (files: File[]) => void
}

export const EditorDropArea = memo(function EditorDropArea(props: Props) {
  const { children, onFilesDrop } = props
  const [dragActive, setDragActive] = useState(false)
  const dragCounter = useRef(0)
  const hasDraggedFiles = (event: DragEvent<HTMLDivElement>) => {
    const types = Array.from(event.dataTransfer?.types || [])
    return types.includes('Files')
  }

  return (
    <div
      {...css.props([styles.wrapper, dragActive && styles.wrapper$dragActive])}
      onDragEnter={(event: DragEvent<HTMLDivElement>) => {
        if (!hasDraggedFiles(event)) return
        dragCounter.current += 1
        setDragActive(true)
      }}
      onDragOver={(event: DragEvent<HTMLDivElement>) => {
        if (!hasDraggedFiles(event)) return
        event.preventDefault()
        if (!dragActive) {
          setDragActive(true)
        }
      }}
      onDragLeave={(event: DragEvent<HTMLDivElement>) => {
        if (!hasDraggedFiles(event)) return
        dragCounter.current -= 1
        if (dragCounter.current <= 0) {
          dragCounter.current = 0
          setDragActive(false)
        }
      }}
      onDrop={(event: DragEvent<HTMLDivElement>) => {
        const files = Array.from(event.dataTransfer?.files || []).filter((file) =>
          file.type.startsWith('image/') || file.type.startsWith('video/'),
        )
        if (files.length) {
          event.preventDefault()
          event.stopPropagation()
          onFilesDrop(files)
        }
        dragCounter.current = 0
        setDragActive(false)
      }}>
      {children}
      {dragActive && (
        <div {...css.props(styles.overlay)}>
          <Text size='lg'>
            Drop media to upload
          </Text>
        </div>
      )}
    </div>
  )
})

const styles = css.create({
  wrapper: {
    position: 'relative',
    width: '100%',
  },
  wrapper$dragActive: {
    minHeight: 150,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 4,
    top: 0,
    bottom: 0,
    minHeight: 150,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderColor: palette.outline,
    borderRadius: shape.lg,
    backgroundColor: palette.surfaceContainer,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    pointerEvents: 'none',
    opacity: 0.9,
  },
})
