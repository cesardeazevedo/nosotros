import { useRangeChange } from 'hooks/useRangeChange'
import { observer } from 'mobx-react-lite'
import { useLayoutEffect, useMemo, useRef } from 'react'
import type { FeedModule } from 'stores/modules/feed.module'
import { WindowVirtualizer, type CacheSnapshot, type WindowVirtualizerHandle } from 'virtua'

type Props = {
  feed: FeedModule
  render: (id: string) => React.ReactNode
}

const VirtualListWindow = observer(function VirtualListWindow(props: Props) {
  const { render, feed } = props
  const cacheKey = `window-list-cache-${feed.id}`

  const data = feed.list

  const ref = useRef<WindowVirtualizerHandle>(null)

  const [offset, cache] = useMemo(() => {
    const serialized = sessionStorage.getItem(cacheKey)
    if (!serialized) return []
    try {
      return JSON.parse(serialized) as [number, CacheSnapshot]
    } catch (e) {
      return []
    }
  }, [cacheKey])

  useLayoutEffect(() => {
    if (!ref.current) {
      return
    }
    const handle = ref.current

    window.scrollTo(0, offset ?? 0)

    const onScroll = () => {
      const scrolledTo = window.scrollY + window.innerHeight
      if (scrolledTo >= document.body.scrollHeight - 200) {
        feed.paginate()
      }
    }

    const onUnload = () => {
      sessionStorage.setItem(cacheKey, JSON.stringify([window.scrollY, handle.cache]))
    }

    window.addEventListener('scroll', onScroll)
    window.addEventListener('beforeunload', onUnload)
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('beforeunload', onUnload)
      sessionStorage.setItem(cacheKey, JSON.stringify([window.scrollY, handle.cache]))
    }
  }, [cacheKey, offset, feed])

  const onRangeChange = useRangeChange(feed)

  return (
    <>
      <WindowVirtualizer
        ref={ref}
        cache={cache}
        onRangeChange={(start, end) => onRangeChange([start, end])}>
        {data.map((id) => render(id))}
      </WindowVirtualizer>
    </>
  )
})

export default VirtualListWindow
