/**
 * Experimental, currently not being used, way too much problems, might not be worth it
 */
import { styled } from '@mui/material'
import { Virtualizer, observeWindowOffset, useWindowVirtualizer } from '@tanstack/react-virtual'
import { runInAction, values } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useObservable, useObservableCallback, useSubscription } from 'observable-hooks'
import { useEffect, useRef } from 'react'
import { filter, map, scan, throttleTime } from 'rxjs'
import { bufferTime } from 'stores/core/operators'
import { FeedStore } from 'stores/modules/feed.store'
import { PostStore } from 'stores/modules/post.store'
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

const Container = styled('div')({
  width: '100%',
  position: 'relative',
})

const AbsoluteContainer = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
})

type VirtualizerType = Virtualizer<Window, Element>

const PostListVirtual = observer(function PostListVirtual(props: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const feedRef = useRef<readonly PostStore[]>()
  const feed = values(props.feed.feed)

  const author = props.feed.authors[0]

  const [onScroll, scroll$] = useObservableCallback<VirtualizerType>((input) => input)

  const pagination$ = useObservable(() =>
    scroll$.pipe(
      filter(() => {
        const scrollTop = window.scrollY
        const clientHeight = window.innerHeight
        const scrollHeight = document.documentElement.scrollHeight
        const threshold = 400
        // Check if we're almost at the bottom
        return scrollTop + clientHeight + threshold >= scrollHeight
      }),
      throttleTime(2000, undefined, { leading: true }),
    ),
  )

  const range$ = useObservable(
    () =>
      scroll$.pipe(
        bufferTime(3000),
        map((instances) => {
          const range = [
            ...new Set(instances.flatMap((instance) => [instance.range.startIndex, instance.range.endIndex])),
          ].sort((a, b) => a - b)
          const start = range[0]
          const end = range[range.length - 1]
          return [...Array(1 + end - start).keys()].map((x) => start + x)
        }),
        scan(
          (acc, curr) => {
            const newValues = curr.filter((val) => !acc.seen.has(val))
            newValues.forEach((val) => acc.seen.add(val))
            return { seen: acc.seen, newValues }
          },
          { seen: new Set<number>(), newValues: [] as number[] },
        ),
        map((data) => {
          const items = virtualizer.getVirtualItems()
          return data.newValues.map((index) => items[index].key.toString())
        }),
      ),
    [feed],
  )

  useSubscription(range$, (range) => props.feed.subscribeReactions(range))
  useSubscription(pagination$, () => props.feed.paginate())

  // To use on useEffect unmount without dependency
  feedRef.current = feed

  const virtualizer = useWindowVirtualizer({
    count: feed.length,
    getItemKey: (i) => feed[i]?.event.id || i.toString(),
    estimateSize: (i) => feed[i]?.heightSize || 0,
    observeElementOffset: (instance, callback) => {
      return observeWindowOffset(instance, (offset) => {
        onScroll(instance)
        callback(offset)
      })
    },
    overscan: 10,
  })

  const items = virtualizer.getVirtualItems()

  /**
   * Save the the bounds to correctly reestimate the size of the list and restore the scroll at the right position
   */
  useEffect(() => {
    // props.feed.paginate()
    return () => {
      const items = virtualizer.getVirtualItems()
      runInAction(() => {
        items.forEach((item) => {
          const post = feedRef.current?.[item.index]
          if (post) {
            post.heightSize = item.size
          }
        })
      })
    }
  }, [virtualizer, author])

  return (
    <div ref={ref}>
      <Container sx={{ height: virtualizer.getTotalSize() }}>
        <AbsoluteContainer sx={{ transform: `translateY(${items[0]?.start - virtualizer.options.scrollMargin}px)` }}>
          {items.map((item) => (
            <div key={item.index} data-index={item.index} ref={virtualizer.measureElement}>
              {feed[item.index] && <Post key={feed[item.index].event.id} post={feed[item.index]} />}
            </div>
          ))}
          <Footer />
        </AbsoluteContainer>
      </Container>
    </div>
  )
})

export default PostListVirtual
