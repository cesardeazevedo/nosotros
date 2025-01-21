import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { useNoteOpen } from '@/components/elements/Posts/hooks/useNoteOpen'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { NostrProvider } from '@/components/providers/NostrProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { useGoBack } from '@/hooks/useNavigations'
import { modelStore } from '@/stores/base/model.store'
import type { NAddressModule } from '@/stores/naddress/naddress.module'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronLeft } from '@tabler/icons-react'
import { useLoaderData } from '@tanstack/react-router'
import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import { observer } from 'mobx-react-lite'
import type { AddressPointer } from 'nostr-tools/nip19'
import { css } from 'react-strict-dom'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'

export type Props = AddressPointer

export const NAddressRoute = observer(function NAddressRoute() {
  const module = useLoaderData({ from: '/$nostr' }) as NAddressModule
  const event = modelStore.getAddressable(module.address)
  useNoteOpen(event)
  const isMobile = useMobile()
  const goBack = useGoBack()
  return (
    <NostrProvider nostrContext={() => module.context!}>
      <CenteredContainer sx={styles.root}>
        {!isMobile && (
          <Stack sx={styles.header}>
            <IconButton onClick={goBack} icon={<IconChevronLeft />} />
          </Stack>
        )}
        <PaperContainer elevation={isMobile ? 0 : 2}>
          {!event && <PostLoading rows={1} />}
          {event && <NostrEventRoot item={event} />}
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
