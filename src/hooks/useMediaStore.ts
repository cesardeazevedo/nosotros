import { addMediaErrorAtom, mediaDimsAtom } from '@/atoms/media.atoms'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { IMetaTags } from '@/hooks/parsers/parseImeta'
import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'

export type MediaSize = keyof typeof MAX_BOUNDS

export const MIN_HEIGHT = 180

export const MAX_BOUNDS = {
  sm: {
    maxWidth: 320,
    maxHeight: 340,
  },
  md: {
    maxWidth: 460,
    maxHeight: 480,
  },
  lg: {
    maxWidth: 570,
    maxHeight: 590,
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
  const { maxWidth, maxHeight } = bounds || MAX_BOUNDS.lg

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
  width?: number
  height?: number
  onError?: () => void
}

export function useMediaStore(src: string, imeta: IMetaTags | undefined): MediaProps {
  const dims = useAtomValue(mediaDimsAtom)
  const addError = useSetAtom(addMediaErrorAtom)
  const dim = imeta?.[src]?.dim
  const width = dims.get(src)?.[0] || dim?.width
  const height = dims.get(src)?.[1] || dim?.height
  const bounds = width !== 0 && height !== 0 ? { width, height } : {}
  return {
    ...bounds,
    onError: () => addError(src),
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
        return width && height ? adjustDimensions(width, height, MAX_BOUNDS.sm).height : height
      })
      .filter((x): x is number => !!x)
    const minHeight = Math.min(...heights)
    return Math.max(MIN_HEIGHT, minHeight)
  }, [dims, sources, event])
}
