import { Chip } from '@/components/ui/Chip/Chip'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedModule } from '@/stores/modules/feed.module'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

type Props = {
  module?: FeedModule
  tags?: string[]
}

export const TagHeader = observer(function TagHeader(props: Props) {
  const { module } = props
  const tags = module?.feed.filter['#t'] || props.tags
  return (
    <Stack gap={0.5} sx={styles.root} justify='flex-start'>
      {tags?.slice(0, 4).map((tag) => <Chip key={tag} label={`#${tag}`} />)}
    </Stack>
  )
})

const styles = css.create({
  root: {
    maxWidth: 380,
    overflowX: 'auto',
  },
})
