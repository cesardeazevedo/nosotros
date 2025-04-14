import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Fab } from '@/components/ui/Fab/Fab'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedStore } from '@/stores/feeds/feed.store'
import { duration } from '@/themes/duration.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconArrowUp } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useObservableRef, useObservableState } from 'observable-hooks'
import type { RefObject } from 'react'
import { css } from 'react-strict-dom'
import { delay, filter, fromEvent, map, mergeMap, of, startWith, switchMap } from 'rxjs'

type Props = {
  feed: FeedStore
  ref: RefObject<HTMLElement | null>
}

export const FeedNewPosts = observer(function FeedNewPosts(props: Props) {
  const { feed } = props
  const [, ref$] = useObservableRef(props.ref)
  const [fabVisible] = useObservableState(() => {
    return ref$.pipe(
      map((ref) => ref.current),
      filter((x) => !!x),
      mergeMap((element) => fromEvent(element, 'scroll').pipe(map(() => element))),
      map((x) => x.scrollTop > 250),
      switchMap((isVisible) => {
        return of(isVisible).pipe(delay(isVisible ? 7500 : 0))
      }),
      startWith(false),
    )
  }, false)

  const handleFlush = () => {
    if (props.ref.current) {
      props.ref.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
    feed.flush()
  }
  return (
    <>
      <Expandable expanded={feed.buffer.size > 0}>
        <>
          <Stack justify='center' sx={styles.root}>
            <Button variant='filledTonal' onClick={handleFlush} sx={styles.button}>
              <Stack gap={2}>
                {feed.buffer.size.toString()} new notes
                <UsersAvatars
                  max={3}
                  borderColor='surfaceContainer'
                  renderTooltip={false}
                  pubkeys={feed.bufferPubkeys}
                />
              </Stack>
            </Button>
          </Stack>
          <Divider />
        </>
      </Expandable>
      <Fab
        size='sm'
        variant='primary'
        sx={[styles.fab, fabVisible && feed.buffer.size > 0 && styles.fab$visible]}
        onClick={handleFlush}
        label={
          <Stack gap={2}>
            <Stack gap={1}>
              <IconArrowUp size={20} />
              {feed.buffer.size || ''} new notes
            </Stack>
            <UsersAvatars max={3} borderColor='primary' renderTooltip={false} pubkeys={feed.bufferPubkeys} />
          </Stack>
        }
      />
    </>
  )
})

const styles = css.create({
  root: {
    padding: spacing.padding1,
  },
  button: {
    overflow: 'visible',
  },
  fab: {
    display: 'flex',
    position: 'fixed',
    alignSelf: 'center',
    borderRadius: shape.full,
    top: 20,
    height: 40,
    padding: spacing.padding1,
    width: 'fit-content',
    zIndex: 300,
    margin: 'auto',
    opacity: 0,
    transitionDuration: duration.short3,
    transitionProperty: 'transform, opacity',
  },
  fab$visible: {
    opacity: 1,
    transform: 'translateY(8px)',
  },
})
