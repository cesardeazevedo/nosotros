import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { typeFace } from '@/themes/typeFace.stylex'
import { css } from 'react-strict-dom'

type Props = {
  placeholder: string
}

// Since redering tiptap is a bit expensive,
// this component acts more as a fake editor.
export const EditorPlaceholder = (props: Props) => {
  const { placeholder } = props
  return (
    <Stack sx={styles.root}>
      <Text size='lg' variant='body' sx={styles.label}>
        {placeholder}
      </Text>
    </Stack>
  )
}

const styles = css.create({
  root: {
    cursor: 'pointer',
    userSelect: 'none',
    minHeight: 40,
    opacity: 0.6,
  },
  label: {
    fontWeight: typeFace.medium,
  },
})
