import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { IconCloudOff } from '@tabler/icons-react'
import { MediaScrim } from './MediaScrim'

type Props = {
  error: string | undefined
}

export const MediaError = (props: Props) => {
  const { error } = props
  if (!error) {
    return
  }
  return (
    <MediaScrim>
      <Stack horizontal={false} gap={1} align='center'>
        <IconCloudOff strokeWidth='1.5' size={28} color={'red'} />
        <Text size='sm'>{error}</Text>
      </Stack>
    </MediaScrim>
  )
}
