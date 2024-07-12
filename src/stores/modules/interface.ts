export interface ModuleInterface {
  id: string
  start: () => void
  stop: () => void
  reset?: () => void
  paginate?: () => void
  onRangeChange?: (index: number) => void
}
