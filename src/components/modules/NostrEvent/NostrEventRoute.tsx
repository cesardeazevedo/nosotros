import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { useGoBack } from '@/hooks/useNavigations'
import { useNoteStoreFromId } from '@/hooks/useNoteStore'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronLeft } from '@tabler/icons-react'
import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'

export type Props = {
  id: string
}

export const NostrEventRoute = observer(function NostrEventRoute(props: Props) {
  const { id } = props
  const isMobile = useMobile()
  const note = useNoteStoreFromId(id)
  const goBack = useGoBack()

  return (
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
  )
})

const styles = css.create({
  header: {
    paddingInline: spacing.padding1,
    paddingBottom: spacing.padding1,
  },
})
