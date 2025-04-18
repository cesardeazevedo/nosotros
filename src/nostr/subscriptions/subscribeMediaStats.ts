import { Kind } from '@/constants/kinds'
import { mediaStore } from '@/stores/media/media.store'
import { catchError, defaultIfEmpty, from, fromEvent, map, mergeMap, of, take, tap, toArray } from 'rxjs'
import { getMimeType } from '../helpers/parseImeta'
import type { NostrEventMetadata } from '../types'
import { metadataSymbol } from '../types'

function fromImageMetadata(src: string) {
  const img = new Image()
  // Shouldn't really use rootStore here for works for now
  img.src = `${import.meta.env.VITE_IMGPROXY_URL}/_/feed_img/plain/${src}`
  return fromEvent(img, 'load').pipe(
    take(1),
    tap((e) => {
      const element = e.target as HTMLImageElement
      mediaStore.add(src, [element.naturalWidth, element.naturalHeight])
    }),
  )
}

function fromVideoMetadata(src: string) {
  const video = document.createElement('video')
  video.setAttribute('src', src)
  return fromEvent(video, 'loadedmetadata').pipe(
    take(1),
    tap((e) => {
      const element = e.target as HTMLVideoElement
      mediaStore.add(src, [element.videoWidth, element.videoHeight])
    }),
  )
}

function fromMediaMetadata(mime: 'image' | 'video', src: string, event: NostrEventMetadata) {
  const $ = mime === 'image' ? fromImageMetadata(src) : fromVideoMetadata(src)
  return $.pipe(
    catchError(() => {
      mediaStore.addError(src)
      return of(event)
    }),
  )
}

// Get image and video width and height, this pipeline is very useful
// to avoid content jumping when rendering images and videos
export function subscribeMediaStats() {
  return mergeMap((event: NostrEventMetadata) => {
    switch (event.kind) {
      case Kind.Text:
      case Kind.Article:
      case Kind.Comment: {
        const meta = event[metadataSymbol]
        const imeta = meta.imeta
        const media = meta.contentSchema?.content.filter((x) => x.type === 'video' || x.type === 'image') || []
        if (media.length > 0) {
          return from(media).pipe(
            mergeMap((node) => {
              const src = node.attrs.src as string
              const dim = imeta?.[src]?.dim
              if (dim) {
                const width = dim?.width
                const height = dim?.height
                mediaStore.add(src, [width, height])
                return of(event)
              }
              return fromMediaMetadata(node.type, src, event)
            }),
            toArray(),
            map(() => event),
            defaultIfEmpty(event),
          )
        }
        return of(event)
      }
      case Kind.Media: {
        const meta = event[metadataSymbol]
        return from(Object.entries(meta.imeta || {})).pipe(
          mergeMap(([src, imeta]) => {
            const { dim } = imeta
            if (dim) {
              const width = dim?.width
              const height = dim?.height
              mediaStore.add(src, [width, height])
              return of(event)
            }
            const mime = getMimeType(src, imeta)
            return fromMediaMetadata(mime, src, event)
          }),
          toArray(),
          map(() => event),
          defaultIfEmpty(event),
        )
      }
      default: {
        return of(event)
      }
    }
  })
}
