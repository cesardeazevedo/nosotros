import { EditorProvider } from '@/components/elements/Editor/EditorProvider'
import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { RelayChip } from '@/components/elements/Relays/RelayChip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedState } from '@/hooks/state/useFeed'
import { useResetScroll } from '@/hooks/useResetScroll'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { Feed } from './Feed'
import { FeedSelectedAuthorChip } from './FeedSelectedAuthorChip'
import { FeedHeaderBase } from './headers/FeedHeaderBase'

type Props = {
  feed: FeedState
  header?: React.ReactNode
  headline?: React.ReactNode
  bodyHeader?: React.ReactNode
  sideRail?: React.ReactNode
  renderEditor?: boolean
}

export const FeedRoute = memo(function FeedRoute(props: Props) {
  const { feed, headline, bodyHeader, sideRail, header, renderEditor = true } = props
  useResetScroll()
  return (
    <RouteContainer header={header || <FeedHeaderBase feed={feed} leading='feed' />} headline={headline}>
      <html.div style={styles.contentWrap}>
        <html.div style={styles.contentMain}>
          {renderEditor && (
            <>
              <EditorProvider
                protectedEvent
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
          {bodyHeader}
          {bodyHeader && <Divider />}
          <FeedSelectedAuthorChip feed={feed} />
          <Divider />
          <Feed feed={feed} />
        </html.div>
        {sideRail ? (
          <html.div style={styles.rail}>
            <html.div style={styles.rail$sticky}>
              <Paper outlined surface='surfaceContainerLow' elevation={2} sx={styles.rail$paper}>
                {sideRail}
              </Paper>
            </html.div>
          </html.div>
        ) : null}
      </html.div>
    </RouteContainer>
  )
})

const styles = css.create({
  contentWrap: {
    position: 'relative',
    width: '100%',
  },
  contentMain: {
    position: 'relative',
    zIndex: 1,
  },
  rail: {
    position: 'absolute',
    left: 'calc(100% + 12px)',
    top: 0,
    bottom: 0,
    width: 280,
    zIndex: 2,
    '@media (max-width: 1360px)': {
      display: 'none',
    },
  },
  rail$sticky: {
    position: 'sticky',
    top: 76,
  },
  rail$paper: {
    overflow: 'hidden',
    backgroundColor: palette.surfaceContainerLow,
  },
  editor$header: {
    marginBlock: spacing['padding0.5'],
  },
})
