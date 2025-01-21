import { makeAutoObservable } from 'mobx'

export const toggle = (initialValue = false) => {
  return makeAutoObservable({
    value: initialValue,

    toggle(value?: boolean) {
      this.value = value ?? !this.value
    },
  })
}
