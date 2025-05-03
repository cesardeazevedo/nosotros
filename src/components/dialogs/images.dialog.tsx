import { useBlurhash } from '@/hooks/useBlurhash'
import { useMobile } from '@/hooks/useMobile'
import type { Note } from '@/stores/notes/note'
import { duration } from '@/themes/duration.stylex'
import { palette } from '@/themes/palette.stylex'
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useState } from 'react'
import { css } from 'react-strict-dom'
import { dialogStore } from 'stores/ui/dialogs.store'
import { buttonTokens } from '../ui/Button/Button.stylex'
import { Dialog } from '../ui/Dialog/Dialog'
import { IconButton } from '../ui/IconButton/IconButton'
import { scrimTokens } from '../ui/Scrim/Scrim.stylex'
import { Stack } from '../ui/Stack/Stack'

function adjustDimensions(width: number, height: number): { width: number; height: number } {
  const widthScale = window.innerWidth / width
  const heightScale = window.innerHeight / height

  const scaleFactor = Math.min(widthScale, heightScale)

  return {
    width: Math.floor(width * scaleFactor),
    height: Math.floor(height * scaleFactor),
  }
}

const Img = (props: { src: string; blurhash?: string; dim?: { width: number; height: number } }) => {
  const { src, dim } = props
  const isMobile = useMobile()
  const [loaded, setLoaded] = useState(false)

  // Checks if media was already loaded by the browser to skip the blurhash entirely
  const completed = useMemo(() => {
    const img = new Image()
    img.src = src
    return img.complete
  }, [src])

  const blurhash = useBlurhash(!completed ? props.blurhash : '')
  const adjustedDims = dim ? adjustDimensions(dim?.width, dim?.height) : undefined
  return (
    <>
      {blurhash && adjustedDims && !completed && (
        <img
          src={blurhash}
          {...css.props([
            styles.img,
            styles.img$blur,
            isMobile && styles.img$mobile,
            adjustedDims && styles.bounds(adjustedDims.width, adjustedDims.height),
            loaded && styles.blur$off,
          ])}
          {...adjustedDims}
        />
      )}
      <img
        {...adjustedDims}
        src={src}
        {...css.props([styles.img, isMobile && styles.img$mobile])}
        onLoad={() => setLoaded(true)}
      />
    </>
  )
}

const ImageNavigation = (props: { src: string; note: Note }) => {
  const { note } = props
  const isMobile = useMobile()
  const list = note.imetaList
  const isMultiple = list.length > 1
  const [index, setSelectedItem] = useState(list.findIndex(([, src]) => src === props.src || 0))
  const src = list[index]?.[1] || props.src
  const { blurhash, dim } = list[index]?.[2] || {}
  const disabledLeft = index === 0
  const disabledRight = index === list.length - 1

  const onLeft = () => setSelectedItem((prev) => Math.max(0, prev - 1))
  const onRight = () => setSelectedItem((prev) => Math.min(list.length - 1, prev + 1))

  // prefetch all images for the caroussel
  useEffect(() => {
    list
      .filter(([type]) => type === 'image')
      .forEach(([, src]) => {
        const img = new Image()
        img.src = src
      })
  }, [list])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': {
          onLeft()
          break
        }
        case 'ArrowRight': {
          onRight()
          break
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <>
      <IconButton
        variant='filledTonal'
        sx={styles.close}
        onClick={dialogStore.closeImage}
        icon={<IconX strokeWidth='1.2' size={24} />}
      />
      {isMultiple && !isMobile && (
        <IconButton
          variant='filledTonal'
          sx={[styles.button$left, disabledLeft && styles.button$disable]}
          disabled={disabledLeft}
          onClick={onLeft}>
          <IconChevronLeft />
        </IconButton>
      )}
      <Stack sx={styles.img$container}>
        <Img key={src} src={src} blurhash={blurhash} dim={dim} />
      </Stack>
      {isMultiple && !isMobile && (
        <IconButton
          variant='filledTonal'
          sx={[styles.button$right, disabledRight && styles.button$disable]}
          onClick={onRight}
          disabled={disabledRight}>
          <IconChevronRight />
        </IconButton>
      )}
    </>
  )
}

export const ImagesDialog = observer(function ImagesDialog() {
  const dialog = dialogStore.image
  return (
    <Dialog
      sx={styles.root}
      open={Boolean(dialog)}
      onClose={dialogStore.closeImage}
      slotProps={{ floatingTransition: { sx: styles.floating } }}>
      {dialog && <ImageNavigation src={dialog.src} note={dialog.note} />}
    </Dialog>
  )
})

const styles = css.create({
  root: {
    [scrimTokens.containerColor$darken]: `color-mix(in srgb, #000 92%, transparent)`,
  },
  floating: {
    transform: 'none',
  },
  blur$off: {
    opacity: 0,
  },
  img$container: {
    position: 'relative',
    overflow: 'hidden',
  },
  img: {
    maxWidth: 'calc(100vw - 240px)',
    maxHeight: '100vh',
    height: 'auto',
    pointerEvents: 'none',
    userSelect: 'none',
    backgroundColor: palette.surfaceContainerLow,
  },
  img$mobile: {
    maxWidth: '100%',
    maxHeight: 'calc(100vh - 120px)',
  },
  img$blur: {
    position: 'absolute',
    height: 'auto',
    transitionProperty: 'opacity',
    transitionDuration: duration.short2,
  },
  button$left: {
    position: 'absolute',
    left: 24,
    margin: 'auto',
    top: 0,
    bottom: 0,
  },
  button$right: {
    position: 'absolute',
    margin: 'auto',
    right: 24,
    top: 0,
    bottom: 0,
  },
  button$disable: {
    [buttonTokens.containerColor$disabled]: 'black',
    [buttonTokens.labelTextColor$disabled]: 'white',
  },
  close: {
    position: 'absolute',
    left: 18,
    top: 18,
    zIndex: 10,
    color: 'white',
    bgcolor: 'rgba(0, 0, 0, 0.8)',
  },
  bounds: (width: number, height: number) => ({ width, height }),
})
