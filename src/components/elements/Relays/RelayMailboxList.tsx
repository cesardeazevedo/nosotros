import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { WRITE } from '@/nostr/types'
import { READ } from '@/nostr/types'
import type { User } from '@/stores/users/user'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictReactDOMInputProps } from 'react-strict-dom/dist/types/StrictReactDOMInputProps'
import { PaperContainer } from '../Layouts/PaperContainer'
import { RelayMailboxListLoading } from './RelayMailboxListLoading'
import { RelayUserList } from './RelayUserList'
import { usePublishRelayList } from './relay.hooks'

type Props = {
  isEditing?: boolean
  user: User | undefined
  permission: typeof READ | typeof WRITE
}

export const RelayMailboxList = observer(function RelayMailboxList(props: Props) {
  const { user, permission, isEditing } = props
  const label = permission === READ ? 'Outbox' : 'Inbox'
  const relays = (permission === READ ? user?.outboxRelays : user?.inboxRelays) || []

  const [input, setInput] = useState('')
  const [pending, onSubmit] = usePublishRelayList()
  const [error, setError] = useState<string | false>(false)

  // replace this with react 19 stuff
  const handleSubmit = useCallback(() => {
    try {
      if (!input.startsWith('ws')) {
        setError('Invalid URL')
        return
      }
      const url = new URL(input)
      onSubmit([{ relay: formatRelayUrl(url.href), permission, pubkey: user?.pubkey || '' }, false])
      setError(false)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError('Invalid URL')
    }
  }, [input])

  const total = relays?.length

  return (
    <PaperContainer>
      <Stack horizontal={false}>
        <Stack gap={0.5} sx={styles.header} justify='space-between'>
          <Text variant='title' size='md'>
            {label} Relays {total !== 0 && <html.span style={styles.total}>{`(${total})`}</html.span>}
          </Text>
        </Stack>
        <Divider />
        <Stack gap={2}>
          {relays.length ? (
            <RelayUserList isEditing={isEditing} userRelays={relays} permission={permission} />
          ) : (
            <RelayMailboxListLoading />
          )}
        </Stack>
        {isEditing && (
          <>
            <Divider />
            <Stack sx={styles.footer} justify='space-between' gap={1}>
              <Stack sx={[styles.inputContainer, !!error && styles.inputError]} gap={1}>
                <html.input
                  style={styles.input}
                  type='text'
                  placeholder='wss://'
                  value={input}
                  aria-errormessage={error ? error : null}
                  onChange={(e: StrictReactDOMInputProps['onChange']) => setInput(e.target.value)}
                />
              </Stack>
              <Button disabled={pending} onClick={handleSubmit} variant='filled' sx={styles.button}>
                Add
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </PaperContainer>
  )
})

const styles = css.create({
  section: {
    marginTop: spacing.margin4,
  },
  header: {
    padding: spacing.padding2,
  },
  total: {
    opacity: 0.5,
  },
  footer: {
    padding: spacing.padding1,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: palette.surfaceContainer,
    borderRadius: shape.md,
    overflow: 'hidden',
  },
  input: {
    border: 'none',
    width: '100%',
    height: '100%',
    fontWeight: 500,
    fontSize: typeScale.bodySize$lg,
    padding: spacing.padding2,
    paddingBlock: spacing.padding2,
  },
  inputError: {
    border: '1px solid red',
  },
  button: {
    height: 50,
  },
})
