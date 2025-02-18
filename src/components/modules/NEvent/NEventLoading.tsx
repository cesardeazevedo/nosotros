import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { useGoBack } from '@/hooks/useNavigations'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronLeft } from '@tabler/icons-react'
import { css } from 'react-strict-dom'

export const NEventPending = () => {
  const isMobile = useMobile()
  const goBack = useGoBack()
  return (
    <CenteredContainer sx={styles.root}>
      {!isMobile && (
        <Stack sx={styles.header}>
          <IconButton onClick={goBack} icon={<IconChevronLeft />} />
        </Stack>
      )}
      <PaperContainer>
        <PostLoading rows={1} />
      </PaperContainer>
    </CenteredContainer>
  )
}

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
