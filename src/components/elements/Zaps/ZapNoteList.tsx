import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NoteState } from '@/hooks/state/useNote'
import { useCurrentTheme } from '@/hooks/useTheme'
import { getZapColor } from '@/hooks/useZapColor'
import { spacing } from '@/themes/spacing.stylex'
import type { StyleXVar } from '@stylexjs/stylex/lib/StyleXTypes'
import { IconBoltFilled } from '@tabler/icons-react'
import { memo, useMemo, useState } from 'react'
import { css } from 'react-strict-dom'
import { TextClamped } from '../Content/TextClamped'
import { UserAvatar } from '../User/UserAvatar'

function formatSats(amount: number) {
  return `${(amount / 1000).toLocaleString()}`
}

type Props = {
  note: NoteState
}

type ZapInfo = {
  id: string
  amount: number
  pubkey: string
  color: StyleXVar<string>
  comment: string
}

export const ZapNoteList = memo(function ZapNoteList(props: Props) {
  const { note } = props
  const theme = useCurrentTheme()
  const [pageSize, setPageSize] = useState(10)

  const zapsList = useMemo(() => {
    return (note.zaps.data || [])
      .map((event) => {
        const amount = parseInt(event.metadata?.bolt11?.amount?.value || '0')
        const description = event.tags.find((t) => t[0] === 'description')?.[1] || ''
        const comment = JSON.parse(description || '{}')?.content || ''
        const pubkey = event.tags.find((t) => t[0] === 'P')?.[1] || event.pubkey
        const color = getZapColor(amount / 1000, theme, false)
        return { id: event.id, amount, pubkey, color, comment }
      })
      .filter((zap): zap is ZapInfo => !!zap.pubkey && zap.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  }, [theme, note.zaps.data])

  if (zapsList.length === 0) {
    return
  }

  return (
    <Stack horizontal={false} align='flex-start' sx={styles.root}>
      <table cellPadding={2}>
        <tbody>
          {zapsList.slice(0, pageSize).map(({ id, amount, pubkey, color, comment }) => (
            <tr key={id}>
              <td style={{ width: 32, paddingLeft: 0 }} align='left'>
                <IconBoltFilled size={22} color={color} />
              </td>
              <td style={{ width: 36 }}>
                <UserAvatar size='xs' pubkey={pubkey} />
              </td>
              <td style={{ paddingRight: 8 }}>
                <Text variant='body' size='md' sx={styles.amount}>
                  <span style={{ fontWeight: 600, color }}>{formatSats(amount)}</span>
                </Text>
              </td>
              <td>
                <Stack sx={styles.comment} horizontal={false}>
                  <TextClamped lines={1}>
                    <Text variant='body' size='md'>
                      {comment}
                    </Text>
                  </TextClamped>
                </Stack>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {zapsList.length > 10 && pageSize < zapsList.length && (
        <>
          <Button sx={styles.showMore} variant='filledTonal' onClick={() => setPageSize((s) => s + 10)}>
            Show {zapsList.length - 10} more zaps
          </Button>
        </>
      )}
    </Stack>
  )
})

const styles = css.create({
  root: {
    paddingTop: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  showMore: {
    marginTop: spacing.margin2,
    marginBottom: spacing.margin1,
    marginLeft: spacing.margin4,
  },
  comment: {
    maxWidth: 320,
  },
  amount: {
    width: 65,
    textAlign: 'left',
  },
})
