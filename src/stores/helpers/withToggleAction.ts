import type { IStateTreeNode } from 'mobx-state-tree'

type OnlyProperties<T> = {
  [K in keyof T]: K extends keyof T ? T[K] : never
}

export const withToggleAction = <T extends IStateTreeNode>(instance: T) => ({
  toggle<K extends keyof OnlyProperties<T>>(field: K, value?: boolean) {
    const newValue = value ?? !instance[field]
    ;(instance[field] as boolean) = newValue
  },
})
