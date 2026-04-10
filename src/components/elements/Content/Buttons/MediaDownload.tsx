import { IconButton } from '@/components/ui/IconButton/IconButton'
import { IconDownload } from '@tabler/icons-react'
import { css } from 'react-strict-dom'

type Props = {
  src: string
  fallbackName: 'image' | 'video'
}

const getFilename = (src: string, fallbackName: Props['fallbackName']) => {
  try {
    return new URL(src).pathname.split('/').pop() || fallbackName
  } catch {
    return fallbackName
  }
}

const triggerDownload = (href: string, filename: string, openInNewTab = false) => {
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = filename
  if (openInNewTab) {
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
  }
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export const MediaDownload = (props: Props) => {
  const { src, fallbackName } = props

  const handleDownload = async (event: { preventDefault: () => void; stopPropagation: () => void }) => {
    event.preventDefault()
    event.stopPropagation()
    if (!src) {
      return
    }
    const filename = getFilename(src, fallbackName)

    try {
      const response = await fetch(src)
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`)
      }
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      triggerDownload(objectUrl, filename)
      URL.revokeObjectURL(objectUrl)
      return
    } catch {
      triggerDownload(src, filename, true)
    }
  }

  const onDownload = (event: { preventDefault: () => void; stopPropagation: () => void }) => {
    handleDownload(event).catch(() => { })
  }

  return (
    <IconButton
      size='sm'
      sx={styles.root}
      variant='standard'
      onClick={onDownload}
      icon={<IconDownload strokeWidth='2.5' size={16} />}
    />
  )
}

const styles = css.create({
  root: {
    position: 'absolute',
    right: 42,
    top: 14,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
  },
})
