import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { SxProps } from '@/components/ui/types'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  title?: string
  text: string | undefined
  sx?: SxProps
}

export type CopyButtonRef = {
  copy: () => void
}

const variants = {
  visible: { opacity: 1, scale: 1 },
  hidden: { opacity: 0, scale: 0.5 },
}

export const CopyIconButton = forwardRef<CopyButtonRef, Props>((props, ref) => {
  const { text, title = 'Copy text' } = props
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
      <Tooltip
        cursor='dot'
        placement='left'
        enterDelay={0}
        text={
          copied ? (
            <Stack sx={styles.copied}>
              Copied <IconCheck size={18} />
            </Stack>
          ) : (
            title
          )
        }>
        <IconButton
          size='sm'
          sx={styles.button}
          onClick={handleCopy}
          icon={
            <MotionConfig transition={{ duration: 0.2 }}>
              <AnimatePresence initial={false} mode='wait'>
                {copied ? (
                  <motion.div
                    animate='visible'
                    exit='hidden'
                    initial='hidden'
                    key='check'
                    variants={variants}
                    style={{ display: 'flex' }}>
                    <IconCheck size={18} strokeWidth='2.5' />
                  </motion.div>
                ) : (
                  <motion.div
                    animate='visible'
                    exit='hidden'
                    initial='hidden'
                    key='copy'
                    variants={variants}
                    style={{ display: 'flex' }}>
                    <IconCopy size={18} strokeWidth='1.8' />
                  </motion.div>
                )}
              </AnimatePresence>
            </MotionConfig>
          }
        />
      </Tooltip>
    </html.div>
  )
})

const styles = css.create({
  copied: {
    color: colors.green6,
  },
  button: {
    display: 'flex',
    padding: spacing['padding0.5'],
  },
})
