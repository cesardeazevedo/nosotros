import { Box, BoxProps, IconButton } from '@mui/material'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { Row } from 'components/elements/Layouts/Flex'
import Tooltip from 'components/elements/Layouts/Tooltip'
import { useCallback, useRef, useState } from 'react'

function PostMarkdownCode(props: { sx?: BoxProps['sx']; children: React.ReactNode }) {
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
        pr: 6,
        my: 1,
        borderRadius: 1,
        backgroundColor: 'divider',
        position: 'relative',
        ...props.sx,
      }}>
      <Box sx={{ py: 2, px: 2, overflow: 'scroll' }} component='pre' ref={refPre}>
        {props.children}
      </Box>
      <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
        <Tooltip
          arrow
          placement='left'
          enterDelay={0}
          title={
            !copied ? (
              'Copy code'
            ) : (
              <Row sx={{ color: 'success.main' }}>
                Copied <IconCheck size={18} />
              </Row>
            )
          }>
          <IconButton sx={{ padding: '4px' }} onClick={handleCopy}>
            <IconCopy size={20} strokeWidth='1.5' />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
export default PostMarkdownCode
