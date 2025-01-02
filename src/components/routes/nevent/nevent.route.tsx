import { FeedItem } from '@/components/elements/Feed/FeedItem'
import { NostrProvider } from '@/components/providers/NostrProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { useGoBack } from '@/hooks/useNavigations'
import type { NEventModule } from '@/stores/nevent/nevent.module'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronLeft } from '@tabler/icons-react'
import { useLoaderData } from '@tanstack/react-router'
import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import { PostLoading } from 'components/elements/Posts/PostLoading'
import { observer } from 'mobx-react-lite'
import type { EventPointer } from 'nostr-tools/lib/types/nip19'
import { css } from 'react-strict-dom'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'

export type Props = EventPointer

export const NEventRoute = observer(function NoteRoute() {
  const module = useLoaderData({ from: '/$nostr' }) as NEventModule
  const isMobile = useMobile()

  const goBack = useGoBack()
  const note = module.note

  return (
    <NostrProvider nostrContext={() => module.context!}>
      <CenteredContainer sx={styles.root}>
        {!isMobile && (
          <Stack sx={styles.header}>
            <IconButton onClick={goBack} icon={<IconChevronLeft />} />
          </Stack>
        )}
        <PaperContainer elevation={isMobile ? 0 : 2}>
          {note ? <FeedItem item={note} /> : <PostLoading rows={1} />}
        </PaperContainer>
      </CenteredContainer>
    </NostrProvider>
  )
})

const MOBILE = '@media (max-width: 599.95px)'

const styles = css.create({
  root: {
    marginTop: {
      default: spacing.margin2,
      [MOBILE]: 0,
    },
    paddingBottom: 200,
  },
  header: {
    paddingInline: spacing.padding1,
    paddingBottom: spacing.padding1,
  },
})
