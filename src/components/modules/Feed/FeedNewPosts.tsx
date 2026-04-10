import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Fab } from '@/components/ui/Fab/Fab'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedState } from '@/hooks/state/useFeed'
import { useMobile } from '@/hooks/useMobile'
import { useSettings } from '@/hooks/useSettings'
import { duration } from '@/themes/duration.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconArrowUp } from '@tabler/icons-react'
import { useObservableRef, useObservableState } from 'observable-hooks'
import { memo, type RefObject } from 'react'
import { css, html } from 'react-strict-dom'
import { delay, fromEvent, map, mergeMap, of, startWith, switchMap } from 'rxjs'
import { useDeckColumn } from '../Deck/hooks/useDeck'

type Props = {
  feed: FeedState
  ref?: RefObject<HTMLElement | null>
}

export const FeedNewPosts = memo(function FeedNewPosts(props: Props) {
  const { feed } = props
  const isMobile = useMobile()
  const isDeck = useDeckColumn()?.index !== undefined
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
        return of(isVisible).pipe(delay(isVisible ? 5000 : 0))
      }),
      startWith(false),
    )
  }, false)

  const handleFlush = () => {
    const element = props.ref?.current || window
    element.scrollTo({ top: 0, behavior: 'instant' })
    feed.flush()
  }

  const bufferTotal = feed.replies ? feed.bufferTotalReplies : feed.bufferTotal
  const bufferPubkeys = feed.replies ? feed.bufferPubkeysReplies : feed.bufferPubkeys
  const sidebarCollapsed = useSettings().sidebarCollapsed

  return (
    <>
      <Expandable expanded={bufferTotal > 0}>
        <>
          <Stack justify='center' sx={styles.root}>
            <Button variant='filledTonal' onClick={handleFlush} sx={styles.button}>
              <Stack gap={2}>
                {bufferTotal} new notes
                <UsersAvatars borderColor='surfaceContainer' renderTooltip={false} pubkeys={bufferPubkeys} />
              </Stack>
            </Button>
          </Stack>
          <Divider />
        </>
      </Expandable>
      <html.div
        key={sidebarCollapsed.toString()}
        style={[
          isDeck ? styles.floating$deck : styles.floating,
          !sidebarCollapsed && !isMobile && styles.floating$sidebar,
        ]}>
        <Fab
          size='sm'
          variant='primary'
          sx={[styles.fab, fabVisible && bufferTotal > 0 && styles.fab$visible, isMobile && styles.fab$mobile]}
          onClick={handleFlush}
          label={
            <Stack gap={2}>
              <Stack gap={1}>
                <IconArrowUp size={20} />
                {bufferTotal} new notes
              </Stack>
              <UsersAvatars borderColor='primary' renderTooltip={false} pubkeys={bufferPubkeys} />
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
    top: 82,
    textAlign: 'center',
    display: 'flex',
    alignSelf: 'center',
    zIndex: 100,
    height: 0,
    right: 0,
    left: 0,
  },
  floating$sidebar: {
    left: {
      default: 0,
      '@media (max-width: 1920px)': 315,
    },
  },
  floating$deck: {
    position: 'sticky',
    margin: 'auto',
    textAlign: 'center',
    top: 84,
    left: 0,
    right: 0,
    height: 0,
    zIndex: 40,
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
    zIndex: 90,
    opacity: 0,
    pointerEvents: 'none',
    transform: 'scale(1)',
    transformOrigin: 'bottom',
    transitionDuration: duration.short3,
    transitionProperty: 'transform, opacity',
    // opacity: 1,
    // pointerEvents: 'auto',
    // transform: 'translateY(8px)',
  },
  fab$mobile: {
    top: 60,
  },
  fab$visible: {
    opacity: 1,
    pointerEvents: 'auto',
    transform: 'translateY(8px)',
  },
})
