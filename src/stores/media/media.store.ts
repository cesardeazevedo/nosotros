import { makeAutoObservable, observable } from 'mobx'

class MediaStore {
  dims = new Map<string, [number, number]>()
  errors = observable.set<string>()

  constructor() {
    makeAutoObservable(this)
  }

  hasError(src: string | undefined) {
    return this.errors.has(src || '')
  }

  add(src: string, dim: [number, number]) {
    this.dims.set(src, dim)
  }

  addError(src: string) {
    this.errors.add(src)
  }
}

export const mediaStore = new MediaStore()
