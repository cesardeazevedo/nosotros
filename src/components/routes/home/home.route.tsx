import { Editor } from '@/components/elements/Editor/Editor'
import { FeedItem } from '@/components/elements/Feed/FeedItem'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { VirtualListWindow } from '@/components/elements/VirtualLists/VirtualListWindow'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useMobile } from '@/hooks/useMobile'
import { useRootStore } from '@/hooks/useRootStore'
import { useFeedScroll } from '@/stores/feeds/hooks/useFeedScroll'
import type { HomeModule } from '@/stores/home/home.module'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown } from '@tabler/icons-react'
import { useLoaderData, useRouter } from '@tanstack/react-router'
import { reaction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { css } from 'react-strict-dom'
import { CenteredContainer } from '../../elements/Layouts/CenteredContainer'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'
import { PostFab } from '../../elements/Posts/PostFab'
import { SignInButtonFab } from '../../elements/SignIn/SignInButtonFab'

export const HomeRoute = observer(function HomeRoute() {
  const mobile = useMobile()
  const router = useRouter()
  const module = useLoaderData({ from: '/' }) as HomeModule
  const auth = useRootStore().auth
  const onRangeChange = useFeedScroll(module.feed)

  useEffect(() => {
    const disposer = reaction(
      () => auth.pubkey,
      () => {
        router.invalidate()
      },
    )
    return () => disposer()
  }, [])

  return (
    <>
      <CenteredContainer margin>
        <PaperContainer elevation={1}>
          {!mobile && (!auth.pubkey ? <SignInButtonFab /> : <PostFab />)}
          <Editor initialOpen={false} allowLongForm={false} store={module.editor} />
        </PaperContainer>
        <br />
        <PaperContainer elevation={1}>
          <Stack sx={styles.header} justify='space-between'>
            <Text variant='headline' size='sm'>
              feed
            </Text>
            {/* todo */}
            <Button variant='filledTonal'>
              <Stack gap={0.5}>
                <IconChevronDown size={18} />
                Following
              </Stack>
            </Button>
          </Stack>
          <Divider />
          <VirtualListWindow
            id={module.id}
            feed={module.feed}
            onRangeChange={onRangeChange}
            onScrollEnd={() => module.feed.paginate()}
            render={(item) => <FeedItem item={item} />}
            footer={<PostLoading />}
          />
        </PaperContainer>
      </CenteredContainer>
    </>
  )
})

const styles = css.create({
  header: {
    padding: spacing.padding1,
    paddingLeft: spacing.padding2,
  },
})
