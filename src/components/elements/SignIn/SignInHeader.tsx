import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { signinStore } from '@/stores/signin/signin.store'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronLeft } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { css } from 'react-strict-dom'

type Props = {
  children: React.ReactNode
}

export const SignInHeader = observer((props: Props) => {
  const { children } = props
  return (
    <Stack align='center' gap={1} justify='center' sx={styles.root}>
      {!signinStore.matches('SELECT') && (
        <IconButton
          size='sm'
          onClick={() => signinStore.back()}
          icon={<IconChevronLeft size={28} strokeWidth='2.5' />}
          sx={styles.back}
        />
      )}
      {children}
    </Stack>
  )
})

const styles = css.create({
  root: {
    padding: spacing.padding4,
    paddingBottom: spacing.padding2,
  },
  back: {
    position: 'absolute',
    left: 20,
    top: 36,
  },
})
