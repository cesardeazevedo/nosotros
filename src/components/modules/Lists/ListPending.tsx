import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { RouteHeader } from '@/components/elements/Layouts/RouteHeader'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'

const rows = [...Array(4).keys()]

export const ListsPending = () => {
  return (
    <>
      <RouteContainer maxWidth='lg' renderDivider={false} header={<RouteHeader label='Lists' />}>
        <Text variant='title' size='lg' sx={styles.subheader}>
          My custom follow lists
        </Text>
        <Stack wrap gap={1} sx={styles.content} align='stretch'>
          {rows.map((row) => (
            <Skeleton animation='wave' key={row} sx={styles.item} />
          ))}
        </Stack>
      </RouteContainer>
    </>
  )
}

const styles = css.create({
  content: {
    padding: spacing.padding2,
  },
  item: {
    width: '49%',
    height: 164,
  },
  subheader: {
    position: 'relative',
    marginTop: spacing.margin2,
    marginLeft: spacing.margin3,
  },
})
