import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import type { Ref } from 'react'
import { useCallback, useImperativeHandle, useState } from 'react'
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

const variants = {
  visible: { opacity: 1, scale: 1 },
  hidden: { opacity: 0, scale: 0.8 },
}

export const CopyButton = (props: Props) => {
  const { ref, text, title = 'Copy text', ...rest } = props
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      })
    }
  }, [text])

  useImperativeHandle(ref, () => ({
    copy: handleCopy,
  }))

  return (
    <html.div style={props.sx}>
      <Button variant='filledTonal' sx={styles.button} onClick={handleCopy} {...rest}>
        <MotionConfig transition={{ duration: 0.08 }}>
          <AnimatePresence initial={false} mode='wait'>
            {copied ? (
              <motion.div animate='visible' exit='hidden' initial='hidden' key='check' variants={variants}>
                <Stack gap={1} justify='center' sx={styles.copied}>
                  <IconCheck size={20} strokeWidth='2' />
                  Copied
                </Stack>
              </motion.div>
            ) : (
              <motion.div animate='visible' exit='hidden' initial='hidden' key='copy' variants={variants}>
                <Stack gap={1} justify='center'>
                  <IconCopy size={20} strokeWidth='1.9' />
                  {title}
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </MotionConfig>
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
