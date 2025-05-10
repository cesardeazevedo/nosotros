import { Chip } from '@/components/ui/Chip/Chip'
import { Stack } from '@/components/ui/Stack/Stack'
import type { MediaModule } from '@/stores/modules/media.module'
import { IconLayoutGrid, IconLayoutRows } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'

type Props = {
  module?: MediaModule
}

export const MediaFeedLayoutButtons = observer(function MediaFeedLayoutButtons(props: Props) {
  const { module } = props
  return (
    <Stack align='flex-end' gap={0.5}>
      <Chip
        selected={module?.layout === 'row'}
        onClick={() => module?.setLayout('row')}
        icon={<IconLayoutRows size={18} strokeWidth='1.5' />}
        label='Row'
      />
      <Chip
        icon={<IconLayoutGrid size={18} strokeWidth='1.5' />}
        selected={module?.layout === 'grid'}
        onClick={() => module?.setLayout('grid')}
        label='Grid'
      />
    </Stack>
  )
})
