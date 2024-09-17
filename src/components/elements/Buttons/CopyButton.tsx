import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { SxProps } from '@/components/ui/types'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { useCallback, useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  title: string
  text: string | undefined
  sx?: SxProps
}

const variants = {
  visible: { opacity: 1, scale: 1 },
  hidden: { opacity: 0, scale: 0.5 },
}

export function CopyButton(props: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (props.text) {
      navigator.clipboard.writeText(props.text).then(() => {
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      })
    }
  }, [props.text])

  return (
    <Tooltip
      cursor='arrow'
      placement='left'
      enterDelay={0}
      text={
        copied ? (
          <Stack sx={styles.copied}>
            Copied <IconCheck size={18} />
          </Stack>
        ) : (
          props.title
        )
      }>
      <IconButton
        sx={[styles.button, props.sx]}
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
                  <IconCheck size={20} strokeWidth='1.5' />
                </motion.div>
              ) : (
                <motion.div
                  animate='visible'
                  exit='hidden'
                  initial='hidden'
                  key='copy'
                  variants={variants}
                  style={{ display: 'flex' }}>
                  <IconCopy size={20} strokeWidth='1.5' />
                </motion.div>
              )}
            </AnimatePresence>
          </MotionConfig>
        }
      />
    </Tooltip>
  )
}

const styles = css.create({
  copied: {
    color: colors.green6,
  },
  button: {
    display: 'flex',
    padding: spacing['padding0.5'],
  },
})
