import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { FeedModule } from '@/stores/modules/feed.module'
import { spacing } from '@/themes/spacing.stylex'
import React from 'react'
import { css } from 'react-strict-dom'

type Props = {
  module: FeedModule
}

const HeadlineBase = (props: { children: React.ReactNode }) => <Stack sx={styles.root}>{props.children}</Stack>

export const FeedHeadline = (props: Props) => {
  const { module } = props
  switch (module.type) {
    case 'reposts':
    case 'quotes': {
      return (
        <HeadlineBase>
          <Text variant='headline' size='lg'>
            Post Interactions
          </Text>
        </HeadlineBase>
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
