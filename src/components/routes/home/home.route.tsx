import { Editor } from '@/components/elements/Editor/Editor'
import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { FeedSettings } from '@/components/elements/Feed/FeedSettings'
import { FeedTabs } from '@/components/elements/Feed/FeedTabs'
import { PostAwait } from '@/components/elements/Posts/PostAwait'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { VirtualListWindow } from '@/components/elements/VirtualLists/VirtualListWindow'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { useRootStore } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { reaction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { css } from 'react-strict-dom'
import { CenteredContainer } from '../../elements/Layouts/CenteredContainer'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'
import { PostFab } from '../../elements/Posts/PostFab'
import { SignInButtonFab } from '../../elements/SignIn/SignInButtonFab'

export const HomeRoute = observer(function HomeRoute() {
  const mobile = useMobile()
  const router = useRouter()
  const { auth, home: module } = useRootStore()
  const feed = module.feed

  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const disposer = reaction(
      () => [auth.pubkey, module.selected],
      () => {
        router.invalidate()
      },
    )
    return () => disposer()
  }, [])

  return (
    <CenteredContainer margin>
      {!mobile && (!auth.pubkey ? <SignInButtonFab /> : <PostFab />)}
      <PaperContainer elevation={1}>
        <FeedTabs module={module}>
          <Button variant='filledTonal' onClick={() => setExpanded((prev) => !prev)}>
            <Stack gap={0.5}>
              {expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              Feed Settings
            </Stack>
          </Button>
        </FeedTabs>
        <Expandable expanded={expanded}>
          <FeedSettings feed={feed} />
        </Expandable>
        <Divider />
        <Stack horizontal={false} align='stretch' justify='space-between'>
          <Editor
            initialOpen={false}
            store={module.editor}
            sx={[styles.editor, module.editor.open.value && styles.editor$open]}
          />
        </Stack>
        <Divider />
        <PostAwait rows={5} promise={feed.delay}>
          <VirtualListWindow
            id={module.id + module.selected}
            feed={feed}
            onScrollEnd={feed.paginate}
            render={(event) => <NostrEventRoot event={event} />}
            footer={<PostLoading rows={5} />}
          />
        </PostAwait>
      </PaperContainer>
    </CenteredContainer>
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
