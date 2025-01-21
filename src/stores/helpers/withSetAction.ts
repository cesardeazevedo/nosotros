// https://mobx-state-tree.js.org/recipes/auto-generated-property-setter-actions
import type { IStateTreeNode, SnapshotIn } from 'mobx-state-tree'

// This custom type helps TS know what properties can be modified by our returned function. It excludes actions and views, but still correctly infers model properties for auto-complete and type safety.
type OnlyProperties<T> = {
  [K in keyof SnapshotIn<T>]: K extends keyof T ? T[K] : never
}

export const withSetAction = <T extends IStateTreeNode>(mstInstance: T & OnlyProperties<T>) => ({
  set<K extends keyof OnlyProperties<T>, V extends SnapshotIn<T>[K]>(field: K, newValue: V) {
    mstInstance[field] = newValue
  },
})
