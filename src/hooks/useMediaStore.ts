import { addMediaErrorAtom, mediaDimsAtom } from '@/atoms/media.atoms'
import type { IMetaTags } from '@/hooks/parsers/parseImeta'
import { useAtomValue, useSetAtom } from 'jotai'

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
