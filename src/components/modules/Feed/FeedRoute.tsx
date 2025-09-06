import { EditorProvider } from '@/components/elements/Editor/EditorProvider'
import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { RelayChip } from '@/components/elements/Relays/RelayChip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedState } from '@/hooks/state/useFeed'
import { useResetScroll } from '@/hooks/useResetScroll'
import { spacing } from '@/themes/spacing.stylex'
import React, { memo } from 'react'
import { css } from 'react-strict-dom'
import { Feed } from './Feed'
import { FeedHeaderBase } from './headers/FeedHeaderBase'

type Props = {
  feed: FeedState
  header?: React.ReactNode
  headline?: React.ReactNode
  renderEditor?: boolean
}

export const FeedRoute = memo(function FeedRoute(props: Props) {
  const { feed, headline, header, renderEditor = true } = props
  useResetScroll()
  return (
    <RouteContainer headline={headline} header={header || <FeedHeaderBase feed={feed} label={'feed'} />}>
      {renderEditor && (
        <>
          <EditorProvider
            relays={feed.options.ctx.relays}
            headerComponent={
              feed.options.ctx.relays && (
                <Stack sx={styles.editor$header}>
                  <RelayChip url={feed.options.ctx.relays[0]} />
                </Stack>
              )
            }
            queryKey={feed.queryKey}
            initialOpen={false}
          />
          <Divider />
        </>
      )}
      <Feed feed={feed} />
    </RouteContainer>
  )
})

const styles = css.create({
  editor$header: {
    marginBlock: spacing['padding0.5'],
  },
})
