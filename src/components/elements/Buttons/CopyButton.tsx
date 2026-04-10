import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useCopyClipboard } from '@/hooks/useCopyClipboard'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import type { Ref } from 'react'
import { useImperativeHandle } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  fullWidth?: boolean
  sx?: SxProps
  title?: string
  ref?: Ref<CopyButtonRef | undefined>
  text: string | undefined
}

type CopyButtonRef = {
  copy: () => void
}

export const CopyButton = (props: Props) => {
  const { ref, text, title = 'Copy text', ...rest } = props
  const { copy, copied } = useCopyClipboard(text)

  useImperativeHandle(ref, () => ({ copy }))

  return (
    <html.div style={props.sx}>
      <Button variant='filledTonal' sx={styles.button} onClick={copy} {...rest}>
        {copied ? (
          <Stack gap={1} justify='center' sx={styles.copied}>
            <IconCheck size={20} strokeWidth='2' />
            Copied
          </Stack>
        ) : (
          <Stack gap={1} justify='center'>
            <IconCopy size={20} strokeWidth='1.9' />
            {title}
          </Stack>
        )}
      </Button>
    </html.div>
  )
}

const styles = css.create({
  copied: {
    color: colors.green6,
  },
  button: {
    height: 50,
  },
})
