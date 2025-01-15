import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { SxProps } from '@/components/ui/types'
import { useRelativeDate } from '@/hooks/useRelativeDate'
import { palette } from '@/themes/palette.stylex'
import type { StringUnitLength } from 'luxon'
import type { NEvent } from 'nostr-tools/nip19'
import { css } from 'react-strict-dom'
import { LinkNEvent } from '../Links/LinkNEvent'

type Props = {
  date: number
  disableLink?: boolean
  nevent?: NEvent
  sx?: SxProps
  dateStyle?: StringUnitLength
}

export const PostHeaderDate = function PostHeaderDate(props: Props) {
  const { date, nevent, disableLink, sx, dateStyle } = props
  const [shortDate, fullDate] = useRelativeDate(date, dateStyle)
  return (
    <LinkNEvent underline nevent={nevent} disableLink={disableLink}>
      <Tooltip text={fullDate}>
        <Text size='sm' sx={[styles.root, sx]}>
          {shortDate}
        </Text>
      </Tooltip>
    </LinkNEvent>
  )
}

const styles = css.create({
  root: {
    whiteSpace: 'nowrap',
    lineHeight: '20px',
    color: palette.onSurfaceVariant,
  },
})
