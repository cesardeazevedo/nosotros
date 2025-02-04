import { useNoteContext } from '@/components/providers/NoteProvider'
import { Chip } from '@/components/ui/Chip/Chip'
import { chipTokens } from '@/components/ui/Chip/Chip.stylex'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { typeScale } from '@/themes/typeScale.stylex'
import { css } from 'react-strict-dom'

export const PostPow = () => {
  const { note } = useNoteContext()
  return (
    note.event.pow && (
      <Tooltip cursor='arrow' text={'This note was created with proof of work'}>
        <Chip sx={styles.chip} variant='assist' label={`PoW-${note.event.pow[2]}`} />
      </Tooltip>
    )
  )
}

const styles = css.create({
  chip: {
    [chipTokens.leadingSpace]: 1,
    [chipTokens.trailingSpace]: 4,
    [chipTokens.containerHeight]: 20,
    [chipTokens.labelTextSize]: typeScale.bodySize$sm,
    opacity: 0.9,
    verticalAlign: 'super',
  },
})
