import { addMediaDimAtom, addMediaErrorAtom } from '@/atoms/media.atoms'
import { store } from '@/atoms/store'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import {
  catchError,
  EMPTY,
  from,
  fromEvent,
  ignoreElements,
  merge,
  mergeMap,
  of,
  take,
  takeUntil,
  tap,
  timer,
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
  return mergeMap((events: NostrEventDB[]) =>
    merge(
      of(events),
      from(events).pipe(
        mergeMap((event) => {
          switch (event.kind) {
            case Kind.Text:
            case Kind.Article:
            case Kind.Comment: {
              const media =
                event.metadata?.contentSchema?.content.filter((x) => x.type === 'video' || x.type === 'image') || []
              if (!media.length) {
                return EMPTY
              }
              return from(media).pipe(
                mergeMap((node) => fromMediaMetadata(node.type, node.attrs.src as string, event)),
                catchError(() => EMPTY),
              )
            }
            case Kind.Media:
            case Kind.Video:
            case Kind.ShortVideo: {
              const entries = Object.entries(event.metadata?.imeta || {})
              if (!entries.length) {
                return EMPTY
              }
              return from(entries).pipe(
                mergeMap(([src, imeta]) => {
                  const mime = getMimeType(src, imeta)
                  return mime ? fromMediaMetadata(mime, src, event) : EMPTY
                }),
                catchError(() => EMPTY),
              )
            }
            default: {
              return EMPTY
            }
          }
        }),
        ignoreElements(),
      ),
    ),
  )
}
