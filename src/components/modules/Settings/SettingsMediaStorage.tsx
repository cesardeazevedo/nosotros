import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { useUserBlossomServers } from '@/hooks/query/useQueryUser'
import { useCurrentAccount, useCurrentPubkey } from '@/hooks/useAuth'
import { spacing } from '@/themes/spacing.stylex'
import { IconPhotoUp, IconPlus } from '@tabler/icons-react'
import { memo, useRef, useState } from 'react'
import { css } from 'react-strict-dom'

export const SettingsMediaStorage = memo(function SettingsMediaStorage() {
  const pubkey = useCurrentPubkey()
  const [open, setOpen] = useState(false)
  const acc = useCurrentAccount()
  const ref = useRef<HTMLInputElement>(null)

  const blossomServerList = useUserBlossomServers<string[]>(pubkey)
  // const [submit, submit$] = useObservableCallback<NostrEvent, [string, Account]>((input$) => {
  //   return input$.pipe(
  //     mergeMap(([url, acc]) => (acc.signer ? publishBlossomServer(url, acc.pubkey, acc.signer.signer) : EMPTY)),
  //     mergeMap((event) => subscribeBlossomServers(event.pubkey)),
  //     tap(() => setOpen(false)),
  //     catchError((error) => {
  //       toastStore.enqueue(error.message)
  //       return EMPTY
  //     }),
  //     repeat(),
  //   )
  // })
  // useSubscription(submit$)

  return (
    <MenuItem
      sx={styles.root}
      label='My Blossom Servers'
      trailingIcon={
        <Stack horizontal={false} gap={1} align='flex-start'>
          {blossomServerList.data?.map((url) => (
            <Stack key={url}>
              <Chip
                variant='input'
                icon={<IconPhotoUp size={18} strokeWidth='1.5' />}
                label={url.replace('https://', '')}
                // onDelete={() => acc && submit([url, acc])}
              />
            </Stack>
          ))}
          <PopoverBase
            opened={open}
            onClose={() => setOpen(false)}
            placement='bottom-start'
            contentRenderer={() => (
              <Paper elevation={2} surface='surfaceContainerLow' sx={styles.paper}>
                <Stack gap={1}>
                  <SearchField ref={ref} sx={styles.search} leading={false} placeholder='https://' />
                  <Button
                    variant='filled'
                    // onClick={() => acc && submit([ref.current?.value || '', acc])}
                  >
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
      }
    />
  )
})

const styles = css.create({
  root: {
    alignItems: 'flex-start',
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
