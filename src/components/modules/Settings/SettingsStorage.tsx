import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { dbSqlite } from '@/nostr/db'
import { spacing } from '@/themes/spacing.stylex'
import { IconDatabase } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { css } from 'react-strict-dom'

const formatter = new Intl.NumberFormat()

const DB_NAME = import.meta.env.VITE_DB_NAME

export const SettingsStorageRoute = () => {
  const [totalEvents, setTotalEvents] = useState<number | null>(null)
  const [totalTags, setTotalTags] = useState<number | null>(null)
  const [dbSizeBytes, setDbSizeBytes] = useState<number | null>(null)

  const [exporting, setExporting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [events, tags, size] = await Promise.all([
        dbSqlite.countEvents(),
        dbSqlite.countTags(),
        dbSqlite.dbSizeBytes(),
      ])
      setTotalEvents(events)
      setTotalTags(tags)
      setDbSizeBytes(size)
    }
    load()
  }, [])

  const handleExport = async () => {
    try {
      setExporting(true)
      const bytes = await dbSqlite.exportDB()
      const blob = new Blob([bytes], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${DB_NAME}.sqlite3`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    try {
      setDeleting(true)
      await dbSqlite.deleteDB()
      setTotalEvents(0)
      setTotalTags(0)
      setDbSizeBytes(0)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <Stack sx={styles.root} horizontal={false}>
      <Stack gap={1}>
        <Text size='md' variant='headline'>
          Browser Relay
        </Text>
        <Chip icon={<IconDatabase size={18} strokeWidth='1.5' />} label='SQLite (WASM)' />
      </Stack>

      <Stack horizontal={false} align='stretch' gap={4}>
        <Stack horizontal={false} sx={styles.middle} align='flex-start' gap={1}>
          <Text sx={styles.number} variant='title' size='lg'>
            {totalEvents !== null ? (
              formatter.format(totalEvents) + ' events'
            ) : (
              <Skeleton variant='rectangular' sx={styles.skeleton} />
            )}
          </Text>
          <Text sx={styles.number} variant='title' size='lg'>
            {totalTags !== null ? (
              formatter.format(totalTags) + ' tags'
            ) : (
              <Skeleton variant='rectangular' sx={styles.skeleton} />
            )}
          </Text>
          <Text sx={styles.number} variant='title' size='lg'>
            {dbSizeBytes !== null ? (
              formatter.format(dbSizeBytes) + ' bytes'
            ) : (
              <Skeleton variant='rectangular' sx={styles.skeleton} />
            )}
          </Text>
        </Stack>

        <Stack gap={1}>
          <Button variant='filled' disabled={exporting} onClick={handleExport}>
            {exporting ? 'Exporting…' : 'Export database'}
          </Button>

          <Button variant='danger' disabled={deleting} onClick={handleDelete}>
            {confirmDelete ? 'Confirm delete database?' : deleting ? 'Deleting…' : 'Delete database'}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  root: {
    width: '100%',
    padding: spacing.padding3,
  },
  middle: {
    paddingBlock: spacing.padding2,
  },
  number: {
    fontFamily: 'monospace',
  },
  skeleton: {
    width: 18,
    height: 24,
  },
})
