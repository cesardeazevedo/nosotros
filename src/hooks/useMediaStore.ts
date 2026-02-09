import { addMediaErrorAtom, mediaDimsAtom } from '@/atoms/media.atoms'
import type { IMetaTags } from '@/hooks/parsers/parseImeta'
import { getImgProxyUrl } from '@/utils/imgproxy'
import { useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'

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
    maxWidth: 440,
    maxHeight: 550,
  },
  carousel: {
    maxWidth: 350,
    maxHeight: 350,
  },
} as const

type MediaProps = {
  src: string
  loaded: boolean
  width?: number
  height?: number
  onError?: () => void
}

export function useMediaStore(src: string, imeta: IMetaTags | undefined, proxy: boolean = true): MediaProps {
  const dims = useAtomValue(mediaDimsAtom)
  const addError = useSetAtom(addMediaErrorAtom)
  const [useFallback, setUseFallback] = useState(false)

  const dim = imeta?.[src]?.dim
  const loaded = !!dims.get(src)
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
    loaded,
    src: proxiedSrc,
    onError: handleError,
  }
}
