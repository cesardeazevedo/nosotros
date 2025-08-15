import { atom } from 'jotai'

export const mediaDimsAtom = atom(new Map<string, [number, number]>())
export const mediaErrorsAtom = atom(new Set<string>())
export const currentVideoAtom = atom<HTMLVideoElement | null>(null)

export function mediaErrorSelector(src?: string) {
  return atom((get) => {
    const set = get(mediaErrorsAtom)
    const key = src || ''
    return set.has(key)
  })
}

export const addMediaDimAtom = atom(null, (get, set, payload: { src: string; dim: [number, number] }) => {
  const map = new Map(get(mediaDimsAtom))
  map.set(payload.src, payload.dim)
  set(mediaDimsAtom, map)
})

export const addMediaErrorAtom = atom(null, (get, set, src: string) => {
  const next = new Set(get(mediaErrorsAtom))
  next.add(src)
  set(mediaErrorsAtom, next)
})

export const setCurrentVideoAtom = atom(
  null,
  async (get, set, args: { video: HTMLVideoElement; autoPlay: boolean }) => {
    const prev = get(currentVideoAtom)

    if (prev && prev !== args.video) {
      try {
        prev.pause()
      } catch {
        // no-op
      }
    }

    set(currentVideoAtom, args.video)

    if (args.autoPlay) {
      try {
        await args.video.play()
      } catch {
        // autoplay might be blocked; ignore
      }
    }
  },
)

export const removeCurrentVideoAtom = atom(null, (get, set, video: HTMLVideoElement) => {
  const curr = get(currentVideoAtom)
  if (curr === video) {
    set(currentVideoAtom, null)
  }
})
