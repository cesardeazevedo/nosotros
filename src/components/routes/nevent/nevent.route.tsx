import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { NostrProvider } from '@/components/providers/NostrProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { useGoBack } from '@/hooks/useNavigations'
import { useNoteStoreFromId } from '@/hooks/useNoteStore'
import type { NEventModule } from '@/stores/modules/nevent.module'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronLeft } from '@tabler/icons-react'
import { useLoaderData } from '@tanstack/react-router'
import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import { observer } from 'mobx-react-lite'
import type { EventPointer } from 'nostr-tools/nip19'
import { css } from 'react-strict-dom'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'

export type Props = EventPointer

export const NEventRoute = observer(function NEventRoute() {
  const module = useLoaderData({ from: '/$nostr' }) as NEventModule
  const isMobile = useMobile()
  const note = useNoteStoreFromId(module.options.id)
  const goBack = useGoBack()
  return (
    <NostrProvider nostrContext={() => module.context!}>
      <CenteredContainer margin>
        {!isMobile && (
          <Stack sx={styles.header}>
            <IconButton onClick={goBack} icon={<IconChevronLeft />} />
          </Stack>
        )}
        <PaperContainer>
          {!note && <PostLoading rows={1} />}
          {note && <NostrEventRoot open event={note.event.event} />}
        </PaperContainer>
      </CenteredContainer>
    </NostrProvider>
  )
})

const styles = css.create({
  header: {
    paddingInline: spacing.padding1,
    paddingBottom: spacing.padding1,
  },
})
