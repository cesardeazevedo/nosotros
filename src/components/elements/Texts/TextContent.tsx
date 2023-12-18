import { Box, Typography, styled } from '@mui/material'
import React from 'react'
import { Token, TokenType } from 'utils/contentParser'
import TextMention from './TextMention'
import TextTag from './TextTag'
import TextUrl from './TextUrl'

type Props = {
  token: Token
  dense?: boolean
  bubble?: boolean
}

const shouldForwardProp = (prop: string) => prop !== 'dense' && prop !== 'bubble'

const Container = styled(Typography, { shouldForwardProp })<{ dense: boolean; bubble: boolean }>(
  ({ dense, bubble, theme }) =>
    theme.unstable_sx({
      px: dense ? 0 : 2,
      py: dense ? 0 : 0,
      lineHeight: dense ? 1.5 : 1.7,
      wordBreak: 'break-word',
      ...(bubble && {
        borderRadius: 1.5,
        backgroundColor: 'var(--mui-palette-FilledInput-bg)',
        px: 1.5,
        pb: 0.6,
      }),
    }),
)

const CodeSpan = styled('span')({
  padding: '.1em .4em',
  borderRadius: 0.9,
  backgroundColor: 'divider',
})

const isEmptyText = (token: Token) => token.content.length === 1 && token.content[0] === ' '

function TextContent(props: Props) {
  const { token, dense = false, bubble = false } = props
  return (
    <>
      {token.kind === 'text' && (
        <Container dense={dense} bubble={isEmptyText(token) ? false : bubble} variant='subtitle1'>
          {token.content.map((text, index) => {
            if (typeof text !== 'string') {
              return (
                <React.Fragment key={text.content.toString() + index}>
                  {text.kind === TokenType.MENTION && <TextMention pubkey={text.content} />}
                  {text.kind === TokenType.TAG && <TextTag content={text.content} />}
                  {text.kind === TokenType.URL && <TextUrl href={text.href} content={text.content} />}
                  {text.kind === TokenType.STRONG && (
                    <Box component='span' fontWeight={600}>
                      {text.content}
                    </Box>
                  )}
                  {text.kind === TokenType.CODESPAN && <CodeSpan>{text.content}</CodeSpan>}
                </React.Fragment>
              )
            }
            return text.replace('&#39;', '')
          })}
        </Container>
      )}
    </>
  )
}

export default TextContent
