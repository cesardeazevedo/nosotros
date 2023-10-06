import { values } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useObservableCallback, useSubscription } from 'observable-hooks'
import { useCallback, useEffect, useRef } from 'react'
import { filter, throttleTime } from 'rxjs'
import { bufferTime } from 'stores/core/operators'
import { FeedStore } from 'stores/modules/feed.store'
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

const PostList = observer(function PostList(props: Props) {
  const feed = values(props.feed.feed)
  const ref = useRef<HTMLSpanElement | null>(null)
  const observedRefs = useRef(new Set()).current
  const seenRefs = useRef(new Set()).current

  const [onScroll, pagination$] = useObservableCallback<void>((input$) =>
    input$.pipe(
      filter(() => {
        const scrollTop = window.scrollY
        const clientHeight = window.innerHeight
        const scrollHeight = document.documentElement.scrollHeight
        const threshold = 470
        // Check if we're almost at the bottom
        return scrollTop + clientHeight + threshold >= scrollHeight
      }),
      throttleTime(2000, undefined, { leading: true }),
    ),
  )

  const [onItemVisible, itemVisible$] = useObservableCallback<number[], number>((input$) =>
    input$.pipe(bufferTime(2000)),
  )

  useSubscription(pagination$, () => {
    props.feed.paginate()
  })

  useSubscription(itemVisible$, (indexes: number[]) => {
    const ids = indexes.map((index) => feed[index]?.event.id)
    props.feed.subscribeReactions(ids)
  })

  const handleScroll = useCallback(() => {
    onScroll()
  }, [onScroll])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    // Trigger first scroll event manually in case there's only one post and the user didn't scroll yet
    setTimeout(() => {
      handleScroll()
    }, 1000)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    if (ref.current && feed.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          const parent = ref.current ? Array.from(ref.current.children) : []
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = parent.indexOf(entry.target)
              if (!seenRefs.has(index)) {
                seenRefs.add(index)
                onItemVisible(index)
              }
            }
          })
        },
        {
          threshold: 0.1,
        },
      )
      const timeout = setTimeout(() => {
        if (ref.current) {
          Array.from(ref.current.children).forEach((node) => {
            if (!observedRefs.has(node) && !node.className.includes('loading')) {
              observer.observe(node)
              observedRefs.add(node)
            }
          })
        }
      })
      return () => {
        observer.disconnect()
        clearTimeout(timeout)
      }
    }
  }, [feed, seenRefs, observedRefs, onItemVisible])

  return (
    <span ref={ref}>
      {feed.map((post) => (
        <Post key={post.event.id} post={post} />
      ))}
      <Footer />
    </span>
  )
})

export default PostList
