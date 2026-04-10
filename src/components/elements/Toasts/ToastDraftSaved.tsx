import { dequeueToastAtom } from '@/atoms/toaster.atoms'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { Link } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { memo } from 'react'
import { css } from 'react-strict-dom'

export const ToastDraftSaved = memo(function ToastDraftSaved() {
  const dequeueToast = useSetAtom(dequeueToastAtom)

  return (
    <Stack horizontal={false} sx={styles.root} gap={1}>
      <Text size='lg'>Draft saved</Text>
      <Link to='/drafts' className={css.props(styles.link).className}>
        <Button
          fullWidth
          variant='filledTonal'
          onClick={() => dequeueToast()}>
          See drafts
        </Button>
      </Link>
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: 290,
    padding: spacing.padding2,
  },
  link: {
    width: '100%',
  },
})
