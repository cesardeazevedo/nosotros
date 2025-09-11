import { Chip } from '@/components/ui/Chip/Chip'
import { chipTokens } from '@/components/ui/Chip/Chip.stylex'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventTag } from '@/hooks/useEventUtils'
import { typeScale } from '@/themes/typeScale.stylex'
import { css } from 'react-strict-dom'

type Props = {
  event: NostrEventDB
}

export const PostPow = (props: Props) => {
  const { event } = props
  const pow = useEventTag(event, 'pow')
  return (
    pow && (
      <Tooltip cursor='arrow' text={'This note was created with proof of work'}>
        <Chip sx={styles.chip} variant='assist' label={`PoW-${pow[2]}`} />
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
