import type { IMetaTags } from '@/nostr/helpers/parseImeta'
import { mediaStore } from '@/stores/media/media.store'

type MediaProps = {
  width?: number
  height?: number
}

export function useMediaStore(src: string, imeta: IMetaTags | undefined): MediaProps {
  const dim = imeta?.[src]?.dim
  const width = mediaStore.dims.get(src)?.[0] || dim?.width
  const height = mediaStore.dims.get(src)?.[1] || dim?.height
  const bounds = width !== 0 && height !== 0 ? { width, height } : {}
  return bounds
}
