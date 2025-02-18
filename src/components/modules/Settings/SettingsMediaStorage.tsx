import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Search } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentPubkey, useRootContext } from '@/hooks/useRootStore'
import { publishBlossomServer } from '@/nostr/publish/publishBlossomServer'
import { subscribeBlossomServers } from '@/nostr/subscriptions/subscribeBlossomServers'
import { blossomStore } from '@/stores/blossom/blossom.store'
import { toastStore } from '@/stores/ui/toast.store'
import { spacing } from '@/themes/spacing.stylex'
import { IconPhotoUp, IconPlus } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import type { NostrEvent } from 'nostr-tools'
import { useObservableCallback, useSubscription } from 'observable-hooks'
import { useRef, useState } from 'react'
import { css } from 'react-strict-dom'
import { catchError, EMPTY, map, mergeMap, repeat, tap } from 'rxjs'

export const SettingsMediaStorage = observer(() => {
  const pubkey = useCurrentPubkey()
  const [open, setOpen] = useState(false)
  const { context } = useRootContext()
  const ref = useRef<HTMLInputElement>(null)

  const [submit, submit$] = useObservableCallback<NostrEvent, string>((input$) => {
    return input$.pipe(
      map((url) => {
        try {
          new URL(url)
          return url
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          throw new Error('Invalid URL')
        }
      }),
      mergeMap((url) => publishBlossomServer(url, context)),
      mergeMap((event) => subscribeBlossomServers(event.pubkey, context)),
      tap(() => setOpen(false)),
      catchError((error) => {
        toastStore.enqueue(error.message)
        return EMPTY
      }),
      repeat(),
    )
  })
  useSubscription(submit$, {
    error: (error) => console.log('error sub', error),
    complete: () => console.log('completed'),
    next: () => {},
  })

  return (
    <Stack horizontal={false} sx={styles.root}>
      <Text variant='headline' size='sm'>
        Media Storage
      </Text>
      <br />
      <Stack align='flex-start' gap={4}>
        <Text size='lg'>My blossom servers</Text>
        <Stack horizontal={false} gap={0.5} align='flex-start'>
          {pubkey &&
            blossomStore.list(pubkey)?.map((url) => (
              <Stack key={url}>
                <Chip
                  variant='input'
                  icon={<IconPhotoUp size={18} strokeWidth='1.5' />}
                  label={url.replace('https://', '')}
                  onDelete={() => submit(url)}
                />
              </Stack>
            ))}
          <PopoverBase
            opened={open}
            onClose={() => setOpen(false)}
            placement='bottom-start'
            contentRenderer={() => (
              <Paper elevation={2} surface='surfaceContainerLow' sx={styles.paper}>
                <Stack gap={0.5}>
                  <Search ref={ref} sx={styles.search} leading={false} placeholder='https://' />
                  <Button variant='filled' onClick={() => submit(ref.current?.value || '')}>
                    Add
                  </Button>
                </Stack>
              </Paper>
            )}>
            {({ setRef, getProps }) => (
              <Chip
                ref={setRef}
                {...getProps()}
                onClick={() => setOpen(true)}
                variant='input'
                label='Add Server'
                icon={<IconPlus size={18} />}
              />
            )}
          </PopoverBase>
        </Stack>
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    padding: spacing.padding2,
  },
  section: {
    padding: spacing.padding1,
  },
  search: {
    height: 40,
  },
  paper: {
    width: 350,
    padding: spacing.padding1,
  },
})
