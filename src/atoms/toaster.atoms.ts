import { atom } from 'jotai'
import type { ReactNode } from 'react'

export type ToastItem = {
  open: boolean
  component?: ReactNode | string
  duration?: number
}

export const toastsAtom = atom<ToastItem[]>([])
export const peekToastAtom = atom((get) => get(toastsAtom)[0])

export const enqueueToastAtom = atom(null, (_, set, payload: { component: ReactNode | string; duration?: number }) => {
  const next: ToastItem = {
    open: true,
    component: payload.component,
    duration: payload.duration ?? 5000,
  }
  set(toastsAtom, (prev) => [...prev, next])
})

export const dequeueToastAtom = atom(null, (get, set) => {
  const list = get(toastsAtom)
  if (list.length === 0) return

  const [first, ...rest] = list
  const firstClosed: ToastItem = { ...first, open: false }
  set(toastsAtom, [firstClosed, ...rest])

  setTimeout(() => {
    set(toastsAtom, (prev) => prev.slice(1))
  }, 250)
})
