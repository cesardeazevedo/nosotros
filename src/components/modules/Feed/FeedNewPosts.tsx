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
import { useContext, type RefObject } from 'react'
import { css, html } from 'react-strict-dom'
import { delay, fromEvent, map, mergeMap, of, startWith, switchMap } from 'rxjs'
import { DeckContext } from '../Deck/DeckContext'

type Props = {
  feed: FeedStore

  ref?: RefObject<HTMLElement | null>
}

export const FeedNewPosts = observer(function FeedNewPosts(props: Props) {
  const { feed } = props
  const isDeck = useContext(DeckContext).index !== undefined
  const [, ref$] = useObservableRef(props.ref)
  const [fabVisible] = useObservableState(() => {
    return ref$.pipe(
      mergeMap((ref) => {
        const element = ref?.current
        if (element) {
          return fromEvent(element, 'scroll').pipe(map(() => element.scrollTop))
        }
        return fromEvent(window, 'scroll').pipe(map(() => window.scrollY))
      }),
      map((position) => position > 250),
      switchMap((isVisible) => {
        return of(isVisible).pipe(delay(isVisible ? 7000 : 0))
      }),
      startWith(false),
    )
  }, false)

  const handleFlush = () => {
    const element = props.ref?.current || window
    element.scrollTo({ top: 0, behavior: 'smooth' })
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
      <html.div style={isDeck ? styles.floating$deck : styles.floating}>
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
      </html.div>
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
  floating: {
    position: 'fixed',
    top: 32,
    textAlign: 'center',
    display: 'flex',
    alignSelf: 'center',
    zIndex: 100,
    height: 0,
  },
  floating$deck: {
    position: 'sticky',
    margin: 'auto',
    textAlign: 'center',
    top: 32,
    left: 0,
    right: 0,
    height: 0,
    zIndex: 100,
  },
  fab: {
    display: 'flex',
    position: 'relative',
    alignSelf: 'center',
    borderRadius: shape.full,
    left: 0,
    right: 0,
    top: 0,
    height: 40,
    padding: spacing.padding1,
    width: 'fit-content',
    margin: 'auto',
    zIndex: 400,
    opacity: 0,
    pointerEvents: 'none',
    transitionDuration: duration.short3,
    transitionProperty: 'transform, opacity',
  },
  fab$visible: {
    opacity: 1,
    pointerEvents: 'auto',
    transform: 'translateY(8px)',
  },
})
