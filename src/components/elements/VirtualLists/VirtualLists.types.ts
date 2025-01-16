import type { VListProps } from 'virtua'

export type FeedAbstract = {
  list: Array<{ id: string }>
}

export type VirtualListProps<T extends FeedAbstract> = {
  id: string
  feed: T
  window?: boolean
  onScrollEnd?: VListProps['onScrollEnd']
  onRangeChange?: (start: number, end: number) => void
  render: (item: T['list'][number]) => React.ReactNode
  divider?: boolean
  header?: React.ReactNode
  footer?: React.ReactNode
}
