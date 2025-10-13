import { cancelBroadcastRequestAtom, getBroadcastRequestAtom } from '@/atoms/broadcast.atoms'
import { publishFailuresAtom, publishSuccessesAtom } from '@/atoms/publish.atoms'
import { Button } from '@/components/ui/Button/Button'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconCheck } from '@tabler/icons-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  id: string
  dense?: boolean
}

const Counter = (props: { count: number; onCancel: () => void }) => {
  const [count, setCount] = useState(props.count)
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((value) => {
        if (value <= 1) {
          clearInterval(interval)
        }
        return value - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  return (
    <>
      {count > 0 ? ` in ${count}...` : ''}
      {count > 0 && (
        <Button
          sx={styles.button}
          onClick={(e) => {
            e.stopPropagation()
            props.onCancel()
          }}>
          Undo
        </Button>
      )}
    </>
  )
}

export const PostCountdown = (props: Props) => {
  const { id, dense = false } = props
  const request = useAtomValue(getBroadcastRequestAtom(id))
  const cancelRequest = useSetAtom(cancelBroadcastRequestAtom)
  const relaysSuccess = useAtomValue(publishSuccessesAtom(id)).length
  const relaysFailed = useAtomValue(publishFailuresAtom(id)).length
  const hasPending = !!request
  if (!hasPending) {
    return
  }
  return (
    <Stack horizontal={false} align='flex-start' sx={[styles.root, dense && styles.root$dense]}>
      <Stack horizontal align='center' sx={styles.chip} gap={1}>
        {request.status === 'done' ? <IconCheck size={18} color={colors.green6} /> : <CircularProgress size='xs' />}
        <Text size='md'>
          <Stack gap={1}>
            {request.status === 'cancelled' && 'Undoing'}
            {request.status === 'pending' && 'Broadcasting'}
            {request.status === 'done' && `Broadcasted to ${relaysSuccess} relays`}
            {request.status === 'done' && relaysFailed > 0 ? (
              <span style={{ color: colors.red7 }}> ({relaysFailed} errors)</span>
            ) : (
              ''
            )}
            {request.status === 'pending' && <Counter count={5} onCancel={() => cancelRequest(id)} />}
          </Stack>
        </Text>
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding1,
    paddingBottom: 0,
  },
  root$dense: {
    padding: 0,
    marginBottom: spacing['margin0.5'],
  },
  chip: {
    paddingBlock: spacing['padding0.5'],
    paddingInline: spacing.padding1,
    borderRadius: 14,
    backgroundColor: palette.surfaceContainer,
  },
  button: {
    paddingInlineStart: spacing.padding1,
    paddingInlineEnd: spacing.padding1,
    fontSize: 12,
    minWidth: 0,
    height: 24,
  },
})
