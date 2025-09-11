import { addMediaErrorAtom, mediaDimsAtom } from '@/atoms/media.atoms'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { IMetaTags } from '@/hooks/parsers/parseImeta'
import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'

export const MAX_BOUNDS = {
  sm: {
    maxWidth: 360,
    maxHeight: 380,
  },
  md: {
    maxWidth: 460,
    maxHeight: 480,
  },
  lg: {
    maxWidth: 540,
    maxHeight: 560,
  },
} as const

export function adjustDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const aspectRatio = width / height

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
        const height = dims.get(src)?.[1] || dim?.height
        return width && height
          ? adjustDimensions(width, height, MAX_BOUNDS.sm.maxWidth, MAX_BOUNDS.sm.maxHeight).height
          : height
      })
      .filter((x): x is number => !!x)
    const minHeight = Math.min(...heights)
    return Math.max(230, minHeight)
  }, [dims, sources, event])
}
