import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Paper } from '@/components/ui/Paper/Paper'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { db } from '@/nostr/db'
import { spacing } from '@/themes/spacing.stylex'
import { IconDatabase } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useObservableState } from 'observable-hooks'
import { useState } from 'react'
import { css } from 'react-strict-dom'
import { delay, from, map, merge, mergeMap, startWith, tap } from 'rxjs'

const formatter = new Intl.NumberFormat()

export const SettingsStorageRoute = observer(function SettingsStorageRoute() {
  const [confirm1, setConfirm1] = useState(false)
  const [confirm2, setConfirm2] = useState(false)

  const [exporting, submitExport] = useObservableState<boolean, void>((input$) => {
    return input$.pipe(
      delay(1000), // to show the pending state
      mergeMap(() =>
        from(db.export()).pipe(
          map(() => false),
          startWith(true),
        ),
      ),
    )
  }, false)

  const [deletingMetadata, submitDeleteMetadata] = useObservableState<boolean, void>((input$) => {
    return input$.pipe(
      delay(1000), // to show the pending state
      mergeMap(() =>
        from(db.deleteMetadata()).pipe(
          map(() => false),
          tap(() => setConfirm1(false)),
          startWith(true),
        ),
      ),
    )
  }, false)

  const [deletingEvents, submitDeleteEvents] = useObservableState<boolean, void>((input$) => {
    return input$.pipe(
      delay(1000), // to show the pending state
      mergeMap(() =>
        merge(from(db.deleteEvents()), from(db.deleteTags())).pipe(
          map(() => false),
          tap(() => setConfirm2(false)),
          startWith(true),
        ),
      ),
    )
  }, false)

  const [totalEvents] = useObservableState(() => from(db.stats.countEvents()), 0)
  const [totalTags] = useObservableState(() => from(db.stats.countTags()), 0)

  return (
    <Stack sx={styles.root} horizontal={false}>
      <Stack gap={1}>
        <Text size='md' variant='headline'>
          Browser Relay
        </Text>
        <Chip icon={<IconDatabase size={18} strokeWidth='1.5' />} label='IndexedDB' />
      </Stack>
      <Stack horizontal={false} align='stretch' gap={4}>
        <Stack justify='flex-end' sx={styles.middle} align='flex-end'>
          <table cellPadding={4}>
            <tbody>
              <tr>
                <td align='right'>
                  <Text variant='title' size='lg'>
                    Events:
                  </Text>
                </td>
                <td>
                  <Text sx={styles.number} variant='title' size='lg'>
                    {totalEvents ? (
                      formatter.format(totalEvents)
                    ) : (
                      <Skeleton variant='rectangular' sx={styles.skeleton} />
                    )}
                  </Text>
                </td>
              </tr>
              <tr>
                <td align='right'>
                  <Text variant='title' size='lg'>
                    Tags:
                  </Text>
                </td>
                <td>
                  <Text sx={styles.number} variant='title' size='lg'>
                    {totalTags ? formatter.format(totalTags) : <Skeleton variant='rectangular' sx={styles.skeleton} />}
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>
        </Stack>
        <Stack horizontal={false} gap={2} align='stretch'>
          <Paper sx={styles.paper} surface='surfaceContainer'>
            <Stack align='center' justify='space-between' gap={2}>
              <Stack horizontal={false}>
                <Text variant='title' size='lg'>
                  Export database
                </Text>
                <Text variant='title' size='sm'>
                  Export all events in the database into a .txt file
                </Text>
              </Stack>
              <Button disabled={!!exporting} variant='filled' onClick={() => submitExport()}>
                <Stack gap={1}>
                  {exporting && <CircularProgress size='xs' />}
                  {exporting ? `Exporting events...` : 'Export'}
                </Stack>
              </Button>
            </Stack>
          </Paper>
          <Paper sx={styles.paper} surface='surfaceContainer'>
            <Stack align='center' justify='space-between' gap={2}>
              <Stack horizontal={false}>
                <Text variant='title' size='lg'>
                  Delete metadata
                </Text>
                <Text variant='title' size='sm'>
                  Some events are parsed to extract some metadata such as event content
                </Text>
              </Stack>
              <Button
                disabled={!!deletingMetadata}
                variant='danger'
                onClick={() => {
                  if (confirm1) {
                    submitDeleteMetadata()
                  } else {
                    setConfirm1(true)
                  }
                }}>
                <Stack gap={1}>
                  {deletingMetadata && <CircularProgress size='xs' />}
                  {confirm1
                    ? 'Confirm delete metadata?'
                    : deletingMetadata
                      ? `Deleting metadata...`
                      : 'Delete metadata'}
                </Stack>
              </Button>
            </Stack>
          </Paper>
          <Paper sx={styles.paper} surface='surfaceContainer'>
            <Stack align='center' justify='space-between' gap={2}>
              <Stack horizontal={false}>
                <Text variant='title' size='lg'>
                  Delete events
                </Text>
              </Stack>
              <Button
                disabled={!!deletingMetadata}
                variant='danger'
                onClick={() => {
                  if (confirm2) {
                    submitDeleteEvents()
                  } else {
                    setConfirm2(true)
                  }
                }}>
                <Stack gap={1}>
                  {deletingEvents && <CircularProgress size='xs' />}
                  {confirm2 ? 'Confirm delete events?' : deletingEvents ? `Deleting events...` : 'Delete events'}
                </Stack>
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    padding: spacing.padding3,
  },
  middle: {
    paddingBlock: spacing.padding2,
  },
  paper: {
    padding: spacing.padding2,
  },
  number: {
    fontFamily: 'monospace',
  },
  skeleton: {
    width: 18,
    height: 24,
  },
})
