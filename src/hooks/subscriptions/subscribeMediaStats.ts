import { addMediaDimAtom, addMediaErrorAtom } from '@/atoms/media.atoms'
import { store } from '@/atoms/store'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import {
  catchError,
  defaultIfEmpty,
  EMPTY,
  from,
  fromEvent,
  map,
  mergeMap,
  of,
  take,
  takeUntil,
  tap,
  timer,
  toArray,
} from 'rxjs'
import { getMimeType } from '../parsers/parseImeta'

function fromImageMetadata(src: string) {
  const img = new Image()
  // We will need to change this when making imgproxy configurable.
  img.src = `${import.meta.env.VITE_IMGPROXY_URL}/_/feed_img/plain/${encodeURIComponent(src)}`

  return fromEvent(img, 'load').pipe(
    take(1),
    tap((e) => {
      const element = e.target as HTMLImageElement

      store.set(addMediaDimAtom, {
        src,
        dim: [element.naturalWidth, element.naturalHeight],
      })
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

      store.set(addMediaDimAtom, {
        src,
        dim: [element.videoWidth, element.videoHeight],
      })
    }),
  )
}

function fromMediaMetadata(mime: 'image' | 'video', src: string, event: NostrEventDB) {
  const $ = mime === 'image'
    ? fromImageMetadata(src)
    : fromVideoMetadata(src)

  return $.pipe(
    takeUntil(timer(2000)),
    catchError(() => {
      store.set(addMediaErrorAtom, src)
      return of(event)
    }),
  )
}

// Get image and video width and height, this pipeline is very useful
// to avoid content jumping when rendering images and videos
// Now works on NostrEventDB[]
export function subscribeMediaStats() {
  return tap((events: NostrEventDB[]) => {
    events.forEach((event) => {
      switch (event.kind) {
        case Kind.Text:
        case Kind.Article:
        case Kind.Comment: {
          const meta = event.metadata
          const media =
            meta?.contentSchema?.content.filter((x) => {
              return x.type === 'video' || x.type === 'image'
            }) || []

          if (media.length > 0) {
            const pipeline$ = from(media).pipe(
              mergeMap((node) => {
                const src = node.attrs.src as string

                // if (dim) {
                //   const width = dim.width
                //   const height = dim.height
                //
                //   store.set(addMediaDimAtom, {
                //     src,
                //     dim: [width, height],
                //   })
                //
                //   return of(event)
                // }

                return fromMediaMetadata(node.type, src, event)
              }),
              toArray(),
              map(() => event),
              defaultIfEmpty(event),
              catchError(() => {
                return EMPTY
              }),
            )

            pipeline$.subscribe()
          }

          break
        }

        case Kind.Media:
        case Kind.Video:
        case Kind.ShortVideo: {
          const meta = event.metadata
          const entries = Object.entries(meta?.imeta || {})

          if (entries.length > 0) {
            const pipeline$ = from(entries).pipe(
              mergeMap(([src, imeta]) => {
                // if (dim) {
                //   const width = dim.width
                //   const height = dim.height
                //
                //   store.set(addMediaDimAtom, {
                //     src,
                //     dim: [width, height],
                //   })
                //
                //   return of(event)
                // }

                const mime = getMimeType(src, imeta)

                if (mime) {
                  return fromMediaMetadata(mime, src, event)
                }

                return EMPTY
              }),
              toArray(),
              map(() => event),
              defaultIfEmpty(event),
              catchError(() => {
                return EMPTY
              }),
            )

            pipeline$.subscribe()
          }

          break
        }

        default: {
          break
        }
      }
    })
  })
}
