import { RelayChip } from '@/components/elements/Relays/RelayChip'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { FeedState } from '@/hooks/state/useFeed'
import { spacing } from '@/themes/spacing.stylex'
import React from 'react'
import { css } from 'react-strict-dom'

type Props = {
  feed: FeedState
}

const HeadlineBase = (props: { children: React.ReactNode }) => <Stack sx={styles.root}>{props.children}</Stack>

export const FeedHeadline = (props: Props) => {
  const { feed } = props
  switch (feed.type) {
    case 'reposts':
    case 'quotes': {
      return (
        <HeadlineBase>
          <Text variant='title' size='lg'>
            Post Interactions
          </Text>
        </HeadlineBase>
      )
    }
    case 'relayfeed': {
      const relay = feed.options.ctx.relays?.[0]
      return (
        relay && (
          <HeadlineBase>
            <RelayChip url={relay} />
          </HeadlineBase>
        )
      )
    }
    default: {
      return null
    }
  }
}

const styles = css.create({
  root: {
    paddingLeft: spacing.padding1,
    paddingBlock: spacing.padding2,
  },
})
