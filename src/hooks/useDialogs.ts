import {
  cameraDialogAtom,
  createDeckDialogAtom,
  imageDialogAtom,
  listFormDialogAtom,
  qrcodeDialogAtom,
  searchDialogAtom,
  statsDialogAtom,
} from '@/atoms/dialog.atoms'
import { useAtomValue } from 'jotai'
import { useResetAtom } from 'jotai/utils'

const dialogAtoms = {
  camera: cameraDialogAtom,
  qrcode: qrcodeDialogAtom,
  search: searchDialogAtom,
  createDeck: createDeckDialogAtom,
  stats: statsDialogAtom,
  listForm: listFormDialogAtom,
  image: imageDialogAtom,
} as const

type DialogKey = keyof typeof dialogAtoms

export function useDialogControl<K extends DialogKey>(key: K) {
  const ref = dialogAtoms[key]
  const value = useAtomValue(ref)
  const onClose = useResetAtom(ref)

  return [value, onClose] as const
}
