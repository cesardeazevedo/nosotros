import { makeAutoObservable, observable } from 'mobx'

class MediaStore {
  dims = new Map<string, [number, number]>()
  errors = observable.set<string>()
  currentVideo: HTMLVideoElement | null = null

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

  setVideo(video: HTMLVideoElement, autoPlay: boolean) {
    if (this.currentVideo && this.currentVideo !== video) {
      this.currentVideo.pause()
    }
    this.currentVideo = video
    if (autoPlay) {
      this.currentVideo.play().catch(() => {})
    }
  }

  removeVideo(video: HTMLVideoElement) {
    if (this.currentVideo === video) {
      this.currentVideo = null
    }
  }
}

export const mediaStore = new MediaStore()
