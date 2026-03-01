import { isDeletedEventAtomFamily } from '@/atoms/deletion.atoms'
import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { PostDeleted } from '@/components/elements/Posts/PostDeleted'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { useEventFromNIP19 } from '@/hooks/query/useQueryBase'
import { useMobile } from '@/hooks/useMobile'
import { useGoBack } from '@/hooks/useNavigations'
import { useResetScroll } from '@/hooks/useResetScroll'
import { spacing } from '@/themes/spacing.stylex'
import { nip19ToId } from '@/utils/nip19'
import { IconChevronLeft } from '@tabler/icons-react'
import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import { useAtomValue } from 'jotai'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'

export type Props = {
  nip19: string
}

export const NostrEventRoute = memo(function NostrEventRoute(props: Props) {
  const { nip19 } = props
  const isMobile = useMobile()
  const note = useEventFromNIP19(nip19, undefined, false)
  const id = nip19ToId(nip19)
  const deleted = useAtomValue(isDeletedEventAtomFamily(id))
  const goBack = useGoBack()
  useResetScroll()

  return (
    <CenteredContainer margin>
      {!isMobile && (
        <Stack sx={styles.header}>
          <IconButton onClick={goBack} icon={<IconChevronLeft />} />
        </Stack>
      )}
      <PaperContainer>
        {deleted && <PostDeleted />}
        {!deleted && !note.data && <PostLoading rows={1} />}
        {!deleted && note.data && <NostrEventRoot open event={note.data} />}
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
