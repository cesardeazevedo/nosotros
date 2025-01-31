import { Divider } from '@/components/ui/Divider/Divider'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import React, { memo, useContext } from 'react'
import { css, html } from 'react-strict-dom'
import { DeckContext } from '../Deck/DeckContext'

type Props = {
  rows?: number
}

export const PostLoading = memo(({ rows = 2 }: Props) => {
  const list = [...Array(rows).keys()]
  const renderDivider = useContext(DeckContext).index !== undefined

  return list.map((key, index) => (
    <React.Fragment key={key}>
      <html.div key={key} style={styles.root}>
        <Stack horizontal>
          <Skeleton animation='wave' variant='circular' sx={styles.circular} />
          <Stack horizontal={false}>
            <Skeleton animation='wave' variant='rectangular' sx={styles.title} />
            <Skeleton animation='wave' variant='rectangular' sx={styles.title2} />
          </Stack>
        </Stack>
        <Skeleton animation='wave' variant='rectangular' sx={styles.content} />
      </html.div>
      {(index !== list.length - 1 || renderDivider) && <Divider />}
    </React.Fragment>
  ))
})

const styles = css.create({
  root: {
    width: '100%',
    padding: spacing.padding2,
    position: 'relative',
  },
  circular: {
    width: 40,
    height: 40,
    marginRight: spacing.margin1,
  },
  title: {
    width: 120,
    height: 12,
  },
  title2: {
    width: 80,
    height: 12,
    marginTop: spacing['margin0.5'],
  },
  content: {
    marginTop: spacing.margin1,
    width: '100%',
    height: 80,
  },
})
