import { Box, IconButton, type BoxProps } from '@mui/material'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { Row } from 'components/elements/Layouts/Flex'
import Tooltip from 'components/elements/Layouts/Tooltip'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import React, { useCallback, useRef, useState } from 'react'
import type { CodeBlockNode } from '../types'

type Props = {
  sx?: BoxProps['sx']
  node: CodeBlockNode
}

const variants = {
  visible: { opacity: 1, scale: 1 },
  hidden: { opacity: 0, scale: 0.5 },
}

function CodeBlock(props: Props) {
  const refPre = useRef<HTMLPreElement>()
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (refPre.current) {
      navigator.clipboard.writeText(refPre.current?.innerText).then(() => {
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      })
    }
  }, [])

  return (
    <Box
      sx={{
        mx: 2,
        pr: 6,
        borderRadius: 1,
        backgroundColor: 'divider',
        position: 'relative',
        ...props.sx,
      }}>
      <Box sx={{ my: 1, py: 1.8, px: 2, overflow: 'scroll' }} component='pre' ref={refPre}>
        {props.node.content.map((node, index) => (
          <React.Fragment key={node.type + index}>{node.type === 'text' && node.text}</React.Fragment>
        ))}
      </Box>
      <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
        <Tooltip
          arrow
          placement='left'
          enterDelay={0}
          title={
            copied ? (
              <Row sx={{ color: 'success.main' }}>
                Copied <IconCheck size={18} />
              </Row>
            ) : (
              'Copy code'
            )
          }>
          <IconButton sx={{ padding: '4px' }} onClick={handleCopy}>
            <MotionConfig transition={{ duration: 0.2 }}>
              <AnimatePresence initial={false} mode='wait'>
                {copied ? (
                  <motion.div animate='visible' exit='hidden' initial='hidden' key='check' variants={variants}>
                    <IconCheck size={20} strokeWidth='1.5' />
                  </motion.div>
                ) : (
                  <motion.div animate='visible' exit='hidden' initial='hidden' key='copy' variants={variants}>
                    <IconCopy size={20} strokeWidth='1.5' />
                  </motion.div>
                )}
              </AnimatePresence>
            </MotionConfig>
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
export default CodeBlock
