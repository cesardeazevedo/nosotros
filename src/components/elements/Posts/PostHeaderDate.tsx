import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { SxProps } from '@/components/ui/types'
import { useRelativeDate } from '@/hooks/useRelativeDate'
import { palette } from '@/themes/palette.stylex'
import type { StringUnitLength } from 'luxon'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { LinkNEvent } from '../Links/LinkNEvent'

type Props = {
  sx?: SxProps
  date: number
  nevent?: string
  dateStyle?: StringUnitLength
}

export const PostHeaderDate = memo(function PostHeaderDate(props: Props) {
  const { nevent, date, sx, dateStyle } = props
  const [shortDate, fullDate] = useRelativeDate(date, dateStyle)
  const content = (
    <Tooltip text={fullDate}>
      <Text size='sm' sx={[styles.root, sx]}>
        {shortDate}
      </Text>
    </Tooltip>
  )

  if (!nevent) {
    return content
  }

  return (
    <LinkNEvent underline nevent={nevent}>
      {content}
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
