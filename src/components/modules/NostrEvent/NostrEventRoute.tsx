import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { useEventFromNIP19 } from '@/hooks/query/useQueryBase'
import { useMobile } from '@/hooks/useMobile'
import { useGoBack } from '@/hooks/useNavigations'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronLeft } from '@tabler/icons-react'
import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'

export type Props = {
  nip19: string
}

export const NostrEventRoute = memo(function NostrEventRoute(props: Props) {
  const { nip19 } = props
  const isMobile = useMobile()
  const note = useEventFromNIP19(nip19)
  const goBack = useGoBack()

  return (
    <CenteredContainer margin>
      {!isMobile && (
        <Stack sx={styles.header}>
          <IconButton onClick={goBack} icon={<IconChevronLeft />} />
        </Stack>
      )}
      <PaperContainer>
        {!note.data && <PostLoading rows={1} />}
        {note.data && <NostrEventRoot open event={note.data} />}
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
