import { dedupe } from '@/core/helpers/dedupe'
import type { CommentMetadata } from '@/nostr/helpers/parseComment'
import { makeAutoObservable, observable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import { Comment } from './comment'

export class CommentStore {
  comments = observable.map<string, Comment>()
  commentsById = observable.map<string, string[]>()

  constructor() {
    makeAutoObservable(this)
  }

  clear() {
    this.comments.clear()
  }

  get(id: string) {
    return this.comments.get(id)
  }

  getReplies(id: string) {
    return this.commentsById.get(id) || []
  }

  add(event: NostrEvent, metadata: CommentMetadata) {
    const found = this.comments.get(event.id)
    if (!found) {
      const comment = new Comment(event, metadata)
      this.comments.set(comment.id, comment)
      if (metadata.parentId) {
        this.commentsById.set(metadata.parentId, dedupe(this.commentsById.get(metadata.parentId), [event.id]))
      }
      return comment
    }
    return found
  }
}

export const commentStore = new CommentStore()
