import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { SxProps } from '@/components/ui/types'
import { useRelativeDate } from '@/hooks/useRelativeDate'
import type { Note } from '@/stores/notes/note'
import { palette } from '@/themes/palette.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { LinkNEvent } from '../Links/LinkNEvent'

type Props = {
  note: Note
  disableLink?: boolean
  sx?: SxProps
}

export const PostHeaderDate = observer(function PostHeaderDate(props: Props) {
  const { note, disableLink, sx } = props
  const [shortDate, fullDate] = useRelativeDate(note.event.created_at)
  return (
    <LinkNEvent underline nevent={note.nevent} disableLink={disableLink}>
      <Tooltip text={fullDate}>
        <Text size='sm' sx={[styles.root, sx]}>
          {shortDate}
        </Text>
      </Tooltip>
    </LinkNEvent>
  )
})

const styles = css.create({
  root: {
    whiteSpace: 'nowrap',
    lineHeight: '20px',
    color: palette.onSurfaceVariant,
  },
})
