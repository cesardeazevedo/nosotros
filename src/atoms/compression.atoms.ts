import { atom } from 'jotai'

export type CompressionState = {
  progress: number
  label: string
}

export const compressionStateAtom = atom<Record<string, CompressionState>>({})

export const setCompressionStateAtom = atom(
  null,
  (get, set, update: { src: string; state: CompressionState }) => {
    const current = get(compressionStateAtom)
    set(compressionStateAtom, { ...current, [update.src]: update.state })
  },
)

export const clearCompressionStateAtom = atom(null, (get, set, src: string) => {
  const current = { ...get(compressionStateAtom) }
  delete current[src]
  set(compressionStateAtom, current)
})
