import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronLeft } from '@tabler/icons-react'
import React from 'react'
import { css } from 'react-strict-dom'
import { useAtomValue, useSetAtom } from 'jotai'
import { pageAtom, backToSelectAtom } from '@/atoms/signin.atoms'

type Props = { children: React.ReactNode }

export const SignInHeader = (props: Props) => {
  const page = useAtomValue(pageAtom)
  const back = useSetAtom(backToSelectAtom)

  return (
    <Stack align='center' gap={1} justify='center' sx={styles.root}>
      {page !== 'SELECT' && (
        <IconButton
          size='sm'
          onClick={() => back()}
          icon={<IconChevronLeft size={28} strokeWidth='2.5' />}
          sx={styles.back}
        />
      )}
      {props.children}
    </Stack>
  )
}

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
