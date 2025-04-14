import { makeAutoObservable, runInAction } from 'mobx'
import type { ReactNode } from 'react'

type ToastItem = {
  open: boolean
  component?: ReactNode | string
  duration?: number
}

export const toastStore = makeAutoObservable({
  toasts: [] as ToastItem[],

  get peek(): ToastItem | undefined {
    return this.toasts[0]
  },

  enqueue(component: ReactNode, options?: { duration: number }) {
    this.toasts.push({ component, open: true, duration: options?.duration || 5000 })
  },

  dequeue() {
    if (this.peek) {
      this.peek.open = false
      // pause between toasts
      setTimeout(() => {
        runInAction(() => {
          this.toasts.shift()
        })
      }, 250)
    }
  },
})
