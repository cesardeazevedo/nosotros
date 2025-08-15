import { EditorProvider } from '@/components/elements/Editor/EditorProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedState } from '@/hooks/state/useFeed'
import { memo } from 'react'
import { FeedReplyTabs } from '../Feed/FeedReplyTabs'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'

type Props = {
  feed: FeedState
  renderEditor?: boolean
  onChangeTabs?: (tab: string | undefined) => void
}

export const HomeHeader = memo(function HomeHeader(props: Props) {
  const { feed, renderEditor = true, onChangeTabs } = props
  return (
    <>
      <FeedHeaderBase feed={feed} leading={<FeedReplyTabs feed={feed} onChange={onChangeTabs} />} />
      <Divider />
      <Stack horizontal={false} align='stretch' justify='space-between'>
        {renderEditor && <EditorProvider queryKey={feed.options.queryKey} initialOpen={false} />}
      </Stack>
    </>
  )
})
