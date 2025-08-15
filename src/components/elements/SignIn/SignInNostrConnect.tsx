import { submitNostrConnectAtom } from '@/atoms/signin.atoms'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { APP_NAME } from '@/constants/app'
import { DEFAULT_NOSTR_CONNECT_RELAY } from '@/constants/relays'
import { NIP46RemoteSigner } from '@/core/signers/nip46.signer'
import { useGoBack } from '@/hooks/useNavigations'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { useSetAtom } from 'jotai'
import { useObservable, useSubscription } from 'observable-hooks'
import { QRCodeCanvas } from 'qrcode.react'
import { useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { from, mergeMap, tap } from 'rxjs'
import type { CopyButtonRef } from '../Buttons/CopyIconButton'
import { SignInHeader } from './SignInHeader'

export const SignInNostrConnect = () => {
  const ref = useRef<CopyButtonRef | null>(null)
  const goBack = useGoBack()
  const submitNostrConnect = useSetAtom(submitNostrConnectAtom)

  const relay = DEFAULT_NOSTR_CONNECT_RELAY
  const [signer] = useState(
    () =>
      new NIP46RemoteSigner({
        method: { method: 'nostrconnect', relay },
        name: APP_NAME,
      }),
  )

  const sub$ = useObservable(() =>
    signer.connected$.pipe(
      mergeMap(() => from(submitNostrConnect({ signer, relay }))),
      tap(() => goBack()),
    ),
  )
  useSubscription(sub$)

  const url = signer.getNostrconnect()

  return (
    <Stack grow horizontal={false} align='center' justify='flex-start' sx={styles.root}>
      <SignInHeader>
        <Text variant='headline'>Sign In with NostrConnect</Text>
      </SignInHeader>
      <Stack grow horizontal={false} align='center' sx={styles.content} gap={4}>
        <CircularProgress size='md' />
        <html.div style={styles.qrcode}>
          <QRCodeCanvas width={500} height={500} size={220} value={url} onClick={ref.current?.copy} />
        </html.div>
        <TextField fullWidth defaultValue={relay} label='Connection Relay' />
        <Text sx={styles.url} size='sm'>
          {url}
        </Text>
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
