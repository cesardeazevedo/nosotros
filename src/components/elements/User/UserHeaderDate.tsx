import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import { DateTime } from 'luxon'
import { observer } from 'mobx-react-lite'
import type { NEvent } from 'nostr-tools/nip19'
import { useMemo } from 'react'
import { css } from 'react-strict-dom'
import { LinkNEvent } from '../Links/LinkNEvent'

type Props = {
  nevent?: NEvent
  date: number
  disableLink?: boolean
  sx?: SxProps
}

export const UserHeaderDate = observer(function UserHeaderDate(props: Props) {
  const { nevent, date, disableLink, sx } = props

  const [shortDate, fullDate] = useMemo(() => {
    const sec = DateTime.fromSeconds(date)
    return [sec.toRelative({ style: 'narrow' })?.replace('ago', ''), sec.toLocaleString(DateTime.DATETIME_FULL)]
  }, [date])

  return (
    <LinkNEvent underline nevent={nevent} disableLink={disableLink}>
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
