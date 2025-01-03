import { Chip } from '@/components/ui/Chip/Chip'
import { Stack } from '@/components/ui/Stack/Stack'
import type { EditorStore } from '@/stores/editor/editor.store'

type Props = {
  store: EditorStore
}

export const EditorMode = (props: Props) => {
  const { store } = props
  return (
    <Stack gap={0.5}>
      <Chip variant='filter' label='Note' selected={!store.isLongForm} onClick={() => store.longForm.toggle(false)} />
      <Chip variant='filter' label='Article' selected={store.isLongForm} onClick={() => store.longForm.toggle(true)} />
    </Stack>
  )
}
