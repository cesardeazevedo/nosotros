import { action, makeAutoObservable } from 'mobx'
import { PostStore } from 'stores/modules/post.store'

export type DialogImageProps = Array<{ content: string } | false>

export class DialogStore {
  auth = false

  camera = false

  qrcode = false

  images: DialogImageProps = [false]

  replies: Array<PostStore | false> = [false]

  constructor() {
    makeAutoObservable(this, {
      openAuth: action.bound,
      openCamera: action.bound,
      openQRCode: action.bound,
      pushReply: action.bound,
      pushImage: action.bound,
      closeAuth: action.bound,
      closeCamera: action.bound,
      closeQRCode: action.bound,
      closeImage: action.bound,
      closeReply: action.bound,
    })
  }

  openAuth() {
    this.auth = true
  }

  closeAuth() {
    this.auth = false
  }

  openCamera() {
    this.camera = true
  }

  closeCamera() {
    this.camera = false
  }

  openQRCode() {
    this.qrcode = true
  }

  closeQRCode() {
    this.qrcode = false
  }

  pushImage(content: string) {
    this.images[this.images.length - 1] = { content }
    this.images.push(false)
  }

  closeImage() {
    this.images.pop()
    this.images[this.images.length - 1] = false
  }

  pushReply(post: PostStore) {
    this.replies[this.replies.length - 1] = post
    this.replies.push(false)
  }

  closeReply() {
    this.replies.pop()
    this.replies[this.replies.length - 1] = false
  }
}
