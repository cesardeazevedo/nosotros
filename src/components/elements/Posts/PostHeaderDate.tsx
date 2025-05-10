import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { SxProps } from '@/components/ui/types'
import { useRelativeDate } from '@/hooks/useRelativeDate'
import { palette } from '@/themes/palette.stylex'
import type { StringUnitLength } from 'luxon'
import type { NEvent } from 'nostr-tools/nip19'
import { useContext } from 'react'
import { css } from 'react-strict-dom'
import { DeckContext } from '../../modules/Deck/DeckContext'
import { LinkNEvent } from '../Links/LinkNEvent'

type Props = {
  date: number
  nevent?: NEvent
  sx?: SxProps
  dateStyle?: StringUnitLength
}

export const PostHeaderDate = function PostHeaderDate(props: Props) {
  const { date, nevent, sx, dateStyle } = props
  const [shortDate, fullDate] = useRelativeDate(date, dateStyle)
  const column = useContext(DeckContext)
  const replaceOnDeck = column.module?.type === 'event'
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
    <LinkNEvent underline nevent={nevent} replaceOnDeck={replaceOnDeck}>
      {content}
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
