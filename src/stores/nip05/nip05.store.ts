import type { Nip05DB } from '@/db/types'
import { makeAutoObservable } from 'mobx'

export const nip05store = makeAutoObservable({
  data: new Map<string, Nip05DB>(),

  get(nip05: string | undefined) {
    return this.data.get(nip05 || '')
  },

  add(nip05: Nip05DB) {
    this.data.set(nip05.nip05, nip05)
  },
})
