import { Box, Typography, styled } from '@mui/material'
import React from 'react'
import { Token, TokenType } from 'utils/contentParser'
import TextMention from './TextMention'
import TextTag from './TextTag'
import TextUrl from './TextUrl'

type Props = {
  token: Token
  dense?: boolean
}

const shouldForwardProp = (prop: string) => prop !== 'dense'

const Container = styled(Typography, { shouldForwardProp })<{ dense: boolean }>(({ dense, theme }) =>
  theme.unstable_sx({
    px: dense ? 0 : 2,
    py: dense ? 0 : 0,
    lineHeight: dense ? 1.5 : 1.7,
    wordBreak: 'break-word',
  }),
)

export const CodeSpan = styled('span')({
  padding: '.1em .4em',
  borderRadius: 6,
  backgroundColor: 'var(--mui-palette-divider)',
})

function TextContent(props: Props) {
  const { token, dense = false } = props
  return (
    <>
      {token.kind === 'text' && (
        <Container dense={dense} variant='subtitle1'>
          {token.content.map((text, index) => {
            if (typeof text !== 'string') {
              return (
                <React.Fragment key={text.content.toString() + index}>
                  {text.kind === TokenType.MENTION && <TextMention pubkey={text.content} />}
                  {text.kind === TokenType.TAG && <TextTag content={text.content} />}
                  {text.kind === TokenType.URL && <TextUrl href={text.href} content={text.content} />}
                  {text.kind === TokenType.BR && <br />}
                  {text.kind === TokenType.CODESPAN && <CodeSpan>{text.content}</CodeSpan>}
                  {text.kind === TokenType.STRONG && (
                    <Box component='span' fontWeight={600}>
                      {text.content}
                    </Box>
                  )}
                </React.Fragment>
              )
            }
            return text
          })}
        </Container>
      )}
    </>
  )
}

export default TextContent
