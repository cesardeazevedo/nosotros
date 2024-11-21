import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronLeft, IconX } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import { useCallback } from 'react'
import { css } from 'react-strict-dom'
import { OnboardMachineContext } from './SignInContext'

export const SignInHeader = () => {
  const machine = OnboardMachineContext.useActorRef()
  const state = OnboardMachineContext.useSelector((x) => x)
  const camera = OnboardMachineContext.useSelector((x) => x.context.camera)

  const isMobile = useMobile()

  const handleBack = useCallback(() => {
    machine.send({ type: 'back' })
  }, [machine])

  const handleCamera = useCallback(() => {}, [])

  return (
    <Stack align='center' gap={1} justify='flex-start' sx={styles.root}>
      {!camera && !state.matches('intro') && (
        <IconButton size='sm' onClick={handleBack} icon={<IconChevronLeft size={28} strokeWidth='2.5' />} />
      )}
      {camera && <IconButton size='sm' onClick={handleCamera} icon={<IconX size={28} strokeWidth='2.0' />} />}
      <Text variant='headline' size='sm'>
        {!isMobile ? 'Sign In' : camera ? 'Camera' : ''}
      </Text>
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
    height: 64,
  },
})
