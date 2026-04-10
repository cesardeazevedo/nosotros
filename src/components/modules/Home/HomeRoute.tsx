import { EditorProvider } from '@/components/elements/Editor/EditorProvider'
import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { Divider } from '@/components/ui/Divider/Divider'
import { Text } from '@/components/ui/Text/Text'
import type { FeedState } from '@/hooks/state/useFeed'
import { useCurrentUser } from '@/hooks/useAuth'
import { useResetScroll } from '@/hooks/useResetScroll'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { Feed } from '../Feed/Feed'
import { FeedsPaneToggleButton } from '../Feed/FeedsPaneToggleButton'
import { FeedSelectedAuthorChip } from '../Feed/FeedSelectedAuthorChip'
import { HomeHeader } from './HomeHeader'

type Props = {
  feed: FeedState
  replies?: boolean
}

export const HomeRoute = memo(function HomeRoute(props: Props) {
  useResetScroll()
  const { feed } = props
  const navigate = useNavigate()
  const user = useCurrentUser()
  const isThreadsRoute = !!useMatch({ from: '/feeds-layout/threads', shouldThrow: false })

  const handleChangeTabs = (anchor: string | undefined) => {
    feed.setPageSize(feed.options.pageSize || 10)
    navigate({ to: anchor === 'replies' ? '/threads' : '/' })
    if ((anchor === 'replies' && isThreadsRoute) || (anchor !== 'replies' && !isThreadsRoute)) {
      feed.onRefresh()
    }
  }

  return (
    <RouteContainer
      header={
        <HomeHeader
          feed={feed}
          leading={
            <Text variant='title' size='lg'>
              Following{' '}
              <html.span style={styles.gray}>
                ({user?.totalFollowing || 0})
              </html.span>
            </Text>
          }
          leadingPrefix={<FeedsPaneToggleButton />}
          onChangeTabs={handleChangeTabs}
        />
      }>
      <EditorProvider queryKey={feed.queryKey} initialOpen />
      <br />
      <FeedSelectedAuthorChip feed={feed} />
      <Divider />
      <Feed feed={feed} />
    </RouteContainer>
  )
})

const styles = css.create({
  gray: {
    opacity: 0.5,
  },
})
