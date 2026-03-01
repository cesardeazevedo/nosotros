import type { MediaFeedModule } from '@/hooks/modules/createMediaFeedModule'
import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import { createFeedAtoms } from './feed.atoms'
import { persistentFeedStatesAtom } from './modules.atoms'

export function createMediaFeedAtoms(options: MediaFeedModule) {
  const feedAtoms = createFeedAtoms(options)
  const layout = focusAtom(feedAtoms.atom, (optic) => optic.prop('layout'))
  const isDirty = atom((get) => {
    return get(feedAtoms.isDirty) || get(feedAtoms.originalState).layout !== get(feedAtoms.atom).layout
  })
  const isModified = atom((get) => {
    const module = (get(persistentFeedStatesAtom)[options.id] || options) as MediaFeedModule
    return get(feedAtoms.isModified) || module.layout !== options.layout
  })
  return {
    ...feedAtoms,
    isDirty,
    isModified,
    layout,
  }
}
