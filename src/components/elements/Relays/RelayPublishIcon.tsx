import type { PublishedEvent } from '@/atoms/publish.atoms'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconBug, IconCheck } from '@tabler/icons-react'
import { css, html } from 'react-strict-dom'

type Props = {
  published: PublishedEvent
}

export const RelayPublishIcon = (props: Props) => {
  const { published } = props
  if (published.status) {
    return (
      <html.span style={styles.success}>
        <IconCheck color='currentColor' size={18} strokeWidth='2.0' />
      </html.span>
    )
  }
  return (
    <Tooltip cursor='arrow' text={published.msg} enterDelay={0}>
      <html.span style={styles.error}>
        <IconBug color='currentColor' size={18} strokeWidth='1.4' />
      </html.span>
    </Tooltip>
  )
}

const styles = css.create({
  success: {
    color: colors.green6,
  },
  error: {
    color: colors.red7,
  },
})
