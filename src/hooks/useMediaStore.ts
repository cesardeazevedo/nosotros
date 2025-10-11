import { addMediaErrorAtom, mediaDimsAtom } from '@/atoms/media.atoms'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { IMetaTags } from '@/hooks/parsers/parseImeta'
import { getImgProxyUrl } from '@/utils/imgproxy'
import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo, useState } from 'react'

export type MediaMode = keyof typeof MAX_BOUNDS

export const MIN_HEIGHT = 180

export const MAX_BOUNDS = {
  single: {
    maxWidth: 550,
    maxHeight: 520,
  },
  single_dense: {
    maxWidth: 500,
    maxHeight: 400,
  },
  single_editor: {
    maxWidth: 350,
    maxHeight: 520,
  },
  pair: {
    maxWidth: 400,
    maxHeight: 520,
  },
  carousel: {
    maxWidth: 350,
    maxHeight: 350,
  },
} as const

export function adjustDimensions(
  width: number,
  height: number,
  bounds: {
    maxWidth: number
    maxHeight: number
  },
): { width: number; height: number } {
  const aspectRatio = width / height
  const { maxWidth, maxHeight } = bounds || MAX_BOUNDS.single

  let newWidth = maxWidth
  let newHeight = maxWidth / aspectRatio

  if (newHeight > maxHeight) {
    newHeight = maxHeight
    newWidth = maxHeight * aspectRatio
  }

  return {
    width: Math.floor(newWidth),
    height: Math.floor(newHeight),
  }
}

type MediaProps = {
  src: string
  width?: number
  height?: number
  onError?: () => void
}

export function useMediaStore(src: string, imeta: IMetaTags | undefined, proxy: boolean = true): MediaProps {
  const dims = useAtomValue(mediaDimsAtom)
  const addError = useSetAtom(addMediaErrorAtom)
  const [useFallback, setUseFallback] = useState(false)

  const dim = imeta?.[src]?.dim
  const width = dims.get(src)?.[0] || dim?.width
  const height = dims.get(src)?.[1] || dim?.height
  const bounds = { width, height }

  const proxiedSrc = proxy && !useFallback ? getImgProxyUrl('feed_img', src) : src

  const handleError = () => {
    if (proxy && !useFallback) {
      setUseFallback(true)
    } else {
      addError(src)
    }
  }

  return {
    ...bounds,
    src: proxiedSrc,
    onError: handleError,
  }
}

// We need to to put all images at the same height in the carousel
export function useMinHeightFromSources(sources: string[], event: NostrEventDB) {
  const dims = useAtomValue(mediaDimsAtom)
  return useMemo(() => {
    const heights = sources
      .map((src) => {
        const dim = event.metadata?.imeta?.[src]?.dim
        const width = dims.get(src)?.[0] || dim?.width
        const height = dims.get(src)?.[1] || dim?.height || 0
        return width && height ? adjustDimensions(width, height, MAX_BOUNDS.carousel).height : height
      })
      .filter((x): x is number => !!x)
    const minHeight = Math.min(...heights)
    return Math.max(MIN_HEIGHT, minHeight)
  }, [dims, sources, event])
}
