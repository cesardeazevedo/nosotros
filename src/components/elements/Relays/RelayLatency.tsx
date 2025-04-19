import { Stack } from '@/components/ui/Stack/Stack'
import { shape } from '@/themes/shape.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { css, html } from 'react-strict-dom'

type Props = {
  value: string | number
}

export const RelayLatency = (props: Props) => {
  return (
    <Stack justify='flex-start' gap={1} sx={styles.root}>
      <html.span style={styles.circle} />
      {props.value}ms
    </Stack>
  )
}

const styles = css.create({
  root: {
    fontFamily: 'monospace',
  },
  circle: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: shape.full,
    backgroundColor: colors.green6,
  },
})
