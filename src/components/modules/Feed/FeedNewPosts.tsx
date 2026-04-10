import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedState } from '@/hooks/state/useFeed'
import { spacing } from '@/themes/spacing.stylex'
import { memo, type RefObject } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  feed: FeedState
  ref?: RefObject<HTMLElement | null>
}

export const FeedNewPosts = memo(function FeedNewPosts(props: Props) {
  const { feed } = props
  const handleFlush = () => {
    const element =
      (props.ref?.current?.closest('section[role="region"]') as HTMLElement | null) || props.ref?.current || window
    element.scrollTo({ top: 0, behavior: 'instant' })
    feed.flush()
  }

  const bufferTotal = feed.replies ? feed.bufferTotalReplies : feed.bufferTotal
  const bufferPubkeys = feed.replies ? feed.bufferPubkeysReplies : feed.bufferPubkeys

  return (
    <>
      <Expandable expanded={bufferTotal > 0}>
        <>
          <Stack justify='center' sx={styles.root}>
            <Button variant='filledTonal' onClick={handleFlush} sx={styles.button}>
              <Stack gap={2}>
                {bufferTotal} new notes
                <UsersAvatars borderColor='surfaceContainer' renderTotal={false} renderTooltip={false} pubkeys={bufferPubkeys} />
              </Stack>
            </Button>
          </Stack>
          <Divider />
        </>
      </Expandable>
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
})
