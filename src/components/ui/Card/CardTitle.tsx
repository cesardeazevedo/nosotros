import { forwardRef } from 'react'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import type { SxProps } from '../types'

type Props = {
  sx?: SxProps
  headline?: React.ReactNode
  subhead?: React.ReactNode
  supportingText?: React.ReactNode
}

export const CardTitle = forwardRef<HTMLDivElement, Props>(function CardTitle(props, forwardedRef) {
  const { sx, headline, subhead, supportingText, ...other } = props

  return (
    <Stack gap={1} align='flex-start' justify='flex-start' horizontal={false} {...other} sx={sx} ref={forwardedRef}>
      <Stack horizontal={false} align='flex-start' justify='flex-start'>
        {headline && (
          <Text variant='title' size='lg'>
            {headline}
          </Text>
        )}
        {subhead && (
          <Text variant='title' size='sm'>
            {subhead}
          </Text>
        )}
      </Stack>
      {supportingText && <Text size='md'>{supportingText}</Text>}
    </Stack>
  )
})
