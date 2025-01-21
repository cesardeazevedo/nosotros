import { Divider } from '@/components/ui/Divider/Divider'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import React, { memo } from 'react'
import { css } from 'react-strict-dom'

export const RelayMailboxListLoading = memo(function RelayMailboxListLoading({ rows = 5 }: { rows?: number }) {
  const list = [...Array(rows).keys()]
  return (
    <Stack horizontal={false} grow>
      {list.map((key, index) => (
        <React.Fragment key={key}>
          <Stack horizontal sx={styles.row} justify='space-between'>
            <Skeleton variant='circular' sx={styles.circular} />
          </Stack>
          {index !== list.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Stack>
  )
})

const styles = css.create({
  row: {
    width: '100%',
    padding: 10,
    paddingInline: spacing.padding2,
  },
  circular: {
    width: 100,
    height: 30,
  },
})
