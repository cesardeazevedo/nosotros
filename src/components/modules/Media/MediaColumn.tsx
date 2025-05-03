import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { MediaModule } from '@/stores/modules/media.module'
import { MediaFeed } from './MediaFeed'
import { MediaHeader } from './MediaHeader'

type Props = {
  module: MediaModule
}

export const MediaColumn = (props: Props) => {
  const { module } = props
  return (
    <Stack horizontal={false}>
      <MediaHeader module={module} />
      <Divider />
      <MediaFeed column module={module} />
    </Stack>
  )
}
