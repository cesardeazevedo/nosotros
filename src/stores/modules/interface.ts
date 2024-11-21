import type { Observable } from 'rxjs'

export interface ModuleInterface<T = unknown> {
  id: string
  list?: T[]
  start: () => Observable<unknown>
  reset?: () => void
  paginate?: () => void
  onRangeChange?: (index: number) => void
}
