import { DeckColumnHeader } from '@/components/elements/Deck/DeckColumnHeader'
import { Editor } from '@/components/elements/Editor/Editor'
import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { FeedSettings } from '@/components/elements/Feed/FeedSettings'
import { FeedTabs } from '@/components/elements/Feed/FeedTabs'
import { IconHomeFilled } from '@/components/elements/Icons/IconHomeFilled'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { PostAwait } from '@/components/elements/Posts/PostAwait'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { VirtualListColumn } from '@/components/elements/VirtualLists/VirtualListColumn'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { router } from '@/Router'
import { useFeedScroll } from '@/stores/feeds/hooks/useFeedScroll'
import type { HomeModule } from '@/stores/home/home.module'
import { spacing } from '@/themes/spacing.stylex'
import { useRouteContext } from '@tanstack/react-router'
import { reaction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  module: HomeModule
}

export const HomeColumn = observer(function HomeColumn(props: Props) {
  const { module } = props
  const { id } = module
  const feed = module.feed
  const context = useRouteContext({ from: '/deck' })
  const onRangeChange = useFeedScroll(feed)

  useEffect(() => {
    const disposer = reaction(
      () => [module.selected],
      () => {
        router.invalidate()
      },
    )
    return () => disposer()
  }, [])

  return (
    <>
      <DeckColumnHeader id={id} settings={<FeedSettings feed={feed} />}>
        <Stack gap={2}>
          <IconHomeFilled />
          <FeedTabs module={module} />
        </Stack>
      </DeckColumnHeader>
      <PaperContainer elevation={0} shape='none'>
        <PostAwait promise={context.delay}>
          <VirtualListColumn
            id={id}
            feed={feed}
            onRangeChange={onRangeChange}
            onScrollEnd={() => feed.paginate()}
            header={
              <>
                <Editor
                  initialOpen={false}
                  store={module.editor}
                  sx={[styles.editor, module.editor.open.value && styles.editor$open]}
                />
                <Divider />
              </>
            }
            footer={
              <>
                <PostLoading rows={8} />
                <Divider />
              </>
            }
            render={(event) => <NostrEventRoot event={event} />}
          />
        </PostAwait>
      </PaperContainer>
    </>
  )
})

const styles = css.create({
  editor: {
    paddingLeft: spacing.padding2,
    paddingBlock: spacing.padding2,
  },
  editor$open: {
    paddingBlock: spacing.padding1,
    paddingTop: spacing.padding2,
  },
})
