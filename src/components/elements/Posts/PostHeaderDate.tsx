import { useContentContext } from '@/components/providers/ContentProvider'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { SxProps } from '@/components/ui/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useRelativeDate } from '@/hooks/useRelativeDate'
import { palette } from '@/themes/palette.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { LinkNEvent } from '../Links/LinkNEvent'

export type StringUnitLength = 'narrow' | 'short' | 'long'

type Props = {
  sx?: SxProps
  date: number
  event?: NostrEventDB
  dateStyle?: StringUnitLength
}

export const PostHeaderDate = memo(function PostHeaderDate(props: Props) {
  const { event, date, sx, dateStyle } = props
  const { disableLink } = useContentContext()
  const [shortDate, fullDate] = useRelativeDate(date, dateStyle)
  const content = (
    <Tooltip text={fullDate}>
      <Text size='sm' sx={[styles.root, sx]}>
        {shortDate}
      </Text>
    </Tooltip>
  )

  if (!event || disableLink) {
    return content
  }

  return (
    <LinkNEvent underline event={event}>
      {content}
    </LinkNEvent>
  )
})

const styles = css.create({
  root: {
    whiteSpace: 'nowrap',
    lineHeight: '20px',
    color: palette.onSurfaceVariant,
    flex: 1,
  },
})
