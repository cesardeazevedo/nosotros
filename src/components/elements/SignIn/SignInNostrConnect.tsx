import { submitNostrConnectAtom } from '@/atoms/signin.atoms'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { APP_NAME } from '@/constants/app'
import { DEFAULT_NOSTR_CONNECT_RELAY } from '@/constants/relays'
import { NIP46RemoteSigner } from '@/core/signers/nip46.signer'
import { useCopyClipboard } from '@/hooks/useCopyClipboard'
import { useGoBack } from '@/hooks/useNavigations'
import { pool } from '@/nostr/pool'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { IconCheck } from '@tabler/icons-react'
import { useSetAtom } from 'jotai'
import { pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import { QRCodeCanvas } from 'qrcode.react'
import { useState } from 'react'
import { css, html } from 'react-strict-dom'
import { from, ignoreElements, map, merge, mergeMap, of, switchMap, tap, throttleTime } from 'rxjs'
import { RelayChip } from '../Relays/RelayChip'
import { SignInHeader } from './SignInHeader'

export const SignInNostrConnect = () => {
  const goBack = useGoBack()
  const submitNostrConnect = useSetAtom(submitNostrConnectAtom)
  const [relay, setRelay] = useState(DEFAULT_NOSTR_CONNECT_RELAY)

  const url$ = useObservable(
    (relay$) => {
      return relay$.pipe(
        pluckFirst,
        throttleTime(1500, undefined, { trailing: true }),
        map((relay) => {
          return new NIP46RemoteSigner(pool, {
            method: { method: 'nostrconnect', relay },
            name: APP_NAME,
          })
        }),
        switchMap((signer) => {
          return merge(
            signer.connected$.pipe(
              // @ts-ignore
              mergeMap(() => from(submitNostrConnect({ signer, relay: signer.options.method.relay }))),
              tap(() => goBack()),
              ignoreElements(),
            ),
            of(signer.getNostrconnect()),
          )
        }),
      )
    },
    [relay],
  )
  const url = useObservableState(url$)

  const { copy, copied } = useCopyClipboard(url)

  return (
    <Stack grow horizontal={false} align='center' justify='flex-start' sx={styles.root}>
      <SignInHeader>
        <Text variant='headline'>Sign In with NostrConnect</Text>
      </SignInHeader>
      <Stack grow horizontal={false} align='center' sx={styles.content} gap={2}>
        <CircularProgress size='md' />
        <Tooltip
          text={
            <Stack gap={0.5}>
              <IconCheck size={18} />
              <Text>Copied</Text>
            </Stack>
          }
          placement='bottom'
          opened={copied}>
          <html.div style={styles.qrcode}>
            {url && <QRCodeCanvas width={500} height={500} size={220} value={url} onClick={copy} />}
          </html.div>
        </Tooltip>
        <Text sx={styles.url} size='sm'>
          {url}
        </Text>
        <RelayChip url={relay} />
        <TextField fullWidth shrink value={relay} onChange={(e) => setRelay(e.target.value)} label='Connection Relay' />
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  root: {
    height: '100%',
  },
  url: {
    width: 320,
    fontFamily: 'monospace',
    [typeScale.bodyLineHeight$lg]: '22px',
    [typeScale.bodyLetterSpacing$lg]: '0px',
  },
  content: {
    width: '100%',
    padding: spacing.padding4,
    paddingTop: spacing.padding1,
  },
  form: {
    width: '100%',
    marginBlock: spacing.margin1,
  },
  qrcode: {
    backgroundColor: 'white',
    padding: spacing.padding2,
    borderRadius: shape.lg,
  },
  copy: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  button: {
    height: 56,
  },
})
