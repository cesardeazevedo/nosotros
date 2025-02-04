import { observable } from 'mobx'

class MediaStore {
  dims = new Map<string, [number, number]>()
  errors = observable.set<string>()

  hasError(src: string) {
    return this.errors.has(src)
  }

  add(src: string, dim: [number, number]) {
    this.dims.set(src, dim)
  }

  addError(src: string) {
    this.errors.add(src)
  }
}

export const mediaStore = new MediaStore()
