import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

export type DialogListForm = NostrEventDB | number | false
export type DialogImage = { eventId?: string; src: string } | false
export type DialogStats = string | false

export const cameraDialogAtom = atomWithReset(false)
export const qrcodeDialogAtom = atomWithReset<string | false>(false)
export const searchDialogAtom = atomWithReset(false)
export const createDeckDialogAtom = atomWithReset(false)
export const statsDialogAtom = atomWithReset<DialogStats>(false)
export const listFormDialogAtom = atomWithReset<DialogListForm>(false)
export const imageDialogAtom = atomWithReset<DialogImage>(false)

export const toggleCameraDialogAtom = atom(null, (get, set, value?: boolean) => {
  set(cameraDialogAtom, value ?? !get(cameraDialogAtom))
})

export const toggleQRCodeDialogAtom = atom(null, (_, set, pubkey: string | false) => {
  set(qrcodeDialogAtom, pubkey)
})

export const toggleSearchDialogAtom = atom(null, (get, set, value?: boolean) => {
  set(searchDialogAtom, value ?? !get(searchDialogAtom))
})

export const toggleCreateDeckDialogAtom = atom(null, (get, set, value?: boolean) => {
  set(createDeckDialogAtom, value ?? !get(createDeckDialogAtom))
})

export const setStatsDialogAtom = atom(null, (_get, set, id: DialogStats) => {
  set(statsDialogAtom, id)
})

export const setListFormDialogAtom = atom(null, (_get, set, value: DialogListForm) => {
  set(listFormDialogAtom, value)
})

export const openImageDialogAtom = atom(null, (_get, set, payload: { eventId?: string; src: string }) => {
  set(imageDialogAtom, { eventId: payload.eventId, src: payload.src })
})

export const closeImageDialogAtom = atom(null, (_get, set) => {
  set(imageDialogAtom, false)
})
