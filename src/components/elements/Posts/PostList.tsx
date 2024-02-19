import { values } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import type { FeedStore } from 'stores/modules/feed.store'
import { WVList, type CacheSnapshot, type WVListHandle } from 'virtua'
import Post from './Post'
import PostLoading from './PostLoading'

type Props = {
  feed: FeedStore
}

function Footer() {
  return (
    <>
      <PostLoading />
      <PostLoading />
    </>
  )
}

const PostList = observer(function PostWindow(props: Props) {
  const feed = values(props.feed.feed)

  const cacheKey = `window-list-cache-${props.feed.options.name}`

  const ref = useRef<WVListHandle>(null)
  const seenRefs = useRef(new Set<number>()).current

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

    let scrollY = 0
    const onScroll = () => {
      scrollY = window.scrollY
    }
    window.addEventListener('scroll', onScroll)
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      sessionStorage.setItem(cacheKey, JSON.stringify([scrollY, handle.cache]))
    }
  }, [cacheKey, offset])

  const handleScrollForReactions = useCallback(
    (start: number, end: number) => {
      const range = [...Array(1 + end - start).keys()].map((x) => start + x)
      const newKeys = range.filter((index) => !seenRefs.has(index))
      range.forEach((index) => seenRefs.add(index))
      props.feed.reactions$.next(newKeys.map((index) => feed[index]?.event.id))
    },
    [seenRefs, props.feed, feed],
  )

  const handleScrollForPagination = useCallback(
    (end: number) => {
      const { size } = props.feed.feed
      if (size > 0 && end >= size - 5) {
        props.feed.paginate$.next()
      }
    },
    [props.feed],
  )

  const handleRangeChange = useCallback(
    (start: number, end: number) => {
      if (start >= 0 && end >= 0) {
        handleScrollForReactions(start, end)
        handleScrollForPagination(end)
      }
    },
    [handleScrollForPagination, handleScrollForReactions],
  )

  return (
    <>
      <WVList ref={ref} cache={cache} onRangeChange={handleRangeChange}>
        {feed.map((note) => (
          <Post key={note.id} note={note} />
        ))}
      </WVList>
      <Footer />
    </>
  )
})

export default PostList
