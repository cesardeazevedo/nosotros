import { Button } from '@/components/ui/Button/Button'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useGoBack } from '@/hooks/useNavigations'
import { useRootContext } from '@/hooks/useRootStore'
import { parseBolt11 } from '@/nostr/helpers/parseZap'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconChevronLeft, IconCircleCheck } from '@tabler/icons-react'
import { Link, useRouter } from '@tanstack/react-router'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { decode } from 'light-bolt11-decoder'
import { DateTime } from 'luxon'
import type { EventPointer } from 'nostr-tools/nip19'
import { useObservableState } from 'observable-hooks'
import { QRCodeCanvas } from 'qrcode.react'
import { useMemo, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { first, map, of } from 'rxjs'
import { CopyButton } from '../Buttons/CopyButtonNormal'
import type { CopyButtonRef } from '../Buttons/CopyIconButton'

type Props = {
  event: EventPointer
  invoice: string
}

const formatter = new Intl.NumberFormat()

const variants = {
  visible: { opacity: 1, scale: 1 },
  hidden: { opacity: 0, scale: 0.8 },
}

export const ZapRequestInvoice = (props: Props) => {
  const { event, invoice } = props

  const context = useRootContext()
  const copyButtonRef = useRef<CopyButtonRef | null>(null)
  const goBack = useGoBack()
  const router = useRouter()

  const bolt11 = useMemo(() => parseBolt11(decode(invoice)), [invoice])

  const amount = bolt11.amount?.value || '0'
  const timestamp = bolt11.timestamp?.value || 0
  const expiration = bolt11.expiry?.value || 0

  const expired = (timestamp + expiration) * 1000
  const expiredLabel = useMemo(() => DateTime.fromMillis(expired).toRelative({ style: 'long' }), [])
  const isExpired = Date.now() > expired

  // For tests
  // useEffect(() => {
  //   setTimeout(() => {
  //     setPaid((prev) => !prev)
  //   }, 2000)
  // }, [])

  const [paid] = useObservableState<boolean>(() => {
    const options = event.relays ? { relays: of(event.relays) } : undefined
    return context.client.zaps.waitForReceipt(event.id, invoice, options).pipe(
      first(),
      map(() => true),
    )
  })

  return (
    <>
      <Stack horizontal={false} sx={styles.root} align='stretch' justify='center'>
        <Stack justify='center' sx={styles.header}>
          <IconButton sx={styles.back} onClick={goBack}>
            <IconChevronLeft />
          </IconButton>
          {!paid && (
            <Text variant='headline' size='sm'>
              {!isExpired ? 'Waiting for payment' : 'Invoice expired'}
            </Text>
          )}
          <div />
        </Stack>
        <MotionConfig transition={{ duration: 0.06 }}>
          <AnimatePresence initial mode='wait'>
            {paid && (
              <motion.div animate='visible' exit='hidden' variants={variants} initial='hidden' key='paid'>
                <Stack horizontal={false} align='center' justify='flex-start' gap={2}>
                  <Text variant='headline' size='sm'>
                    Zap Sent
                  </Text>
                  <Stack sx={styles.paid}>
                    <IconCircleCheck size={120} strokeWidth='1' />
                  </Stack>
                  <Stack>
                    <Text variant='label' size='lg' sx={styles.amount}>
                      Amount: {amount} SATS
                    </Text>
                  </Stack>
                  {/* @ts-ignore */}
                  <Link from={router.fullPath} search={{}}>
                    <Button fullWidth variant='filledTonal'>
                      Close
                    </Button>
                  </Link>
                </Stack>
              </motion.div>
            )}
            {!paid && (
              <motion.div animate='visible' exit='hidden' variants={variants} initial='hidden' key='waiting'>
                <Stack horizontal={false} align='center' justify='center' gap={2}>
                  {isExpired && <Text sx={styles.expired}>{expiredLabel}</Text>}
                  {!isExpired && <CircularProgress size='lg' />}
                  {amount && (
                    <>
                      <Text variant='display' size='md' sx={styles.amount}>
                        <Stack horizontal={false} align='center'>
                          {formatter.format(parseInt(amount) / 1000)}
                          <Text variant='headline' size='sm'>
                            sats
                          </Text>
                        </Stack>
                      </Text>
                    </>
                  )}
                </Stack>
                <br />
                {!isExpired && (
                  <Stack justify='center'>
                    <Text variant='title' size='md'>
                      Scan to pay
                    </Text>
                  </Stack>
                )}
                <html.div style={styles.qrcode}>
                  <QRCodeCanvas
                    onClick={() => copyButtonRef.current?.copy()}
                    size={250}
                    value={invoice.toUpperCase()}
                  />
                </html.div>
                <CopyButton fullWidth text={invoice} title='Copy Invoice' ref={copyButtonRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </MotionConfig>
      </Stack>
    </>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
  },
  header: {
    position: 'relative',
    marginBottom: spacing.margin4,
  },
  back: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  qrcode: {
    margin: 'auto',
    width: 'fit-content',
    backgroundColor: 'white',
    borderRadius: shape.xl,
    padding: spacing.padding2,
    marginBlock: spacing.margin2,
  },
  copyArea: {
    wordBreak: 'break-all',
    fontFamily: 'monospace',
    borderRadius: shape.xl,
    backgroundColor: palette.surfaceContainer,
    padding: spacing.padding1,
  },
  button: {
    height: 55,
  },
  expired: {
    color: palette.error,
  },
  paid: {
    color: colors.green6,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  amount: {
    fontFamily: 'monospace',
  },
})
