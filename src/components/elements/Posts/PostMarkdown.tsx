import { Divider, Typography, styled } from '@mui/material'
import { Box, BoxProps } from '@mui/system'
import TextContent from 'components/elements/Texts/TextContent'
import { Token, TokenType } from 'utils/contentParser'
import PostImage from './PostMedia/PostImage'
import PostVideo from './PostMedia/PostVideo'
import PostNote from './PostNote'

type Props = {
  token: Token
  dense?: boolean
}

const BlockQuote = styled(Box)(({ theme }) =>
  theme.unstable_sx({
    ml: 2,
    my: 4,
    px: 2,
    py: 1,
    borderLeft: '6px solid',
    borderColor: 'divider',
    fontStyle: 'italic',
    color: 'text.secondary',
  }),
)

const Code = styled('pre')(({ theme }) =>
  theme.unstable_sx({
    py: 1,
    px: 2,
    backgroundColor: 'divider',
  }),
)

function Content(props: Props & { component?: BoxProps['component'] }) {
  const { dense, component } = props
  const { content } = props.token
  return (
    <>
      {typeof content !== 'string' &&
        content.map((token, index) => {
          if (typeof token !== 'string') {
            return (
              <Box key={token.kind + index} component={component} sx={{ my: 1 }}>
                {token.kind === TokenType.IMAGE && <PostImage dense={dense} content={token.content} />}
                {token.kind === TokenType.VIDEO && <PostVideo dense={dense} content={token.content} />}
                {token.kind === TokenType.NOTE && <PostNote noteId={token.content} author={token.author} />}
                {token.kind === TokenType.TEXT && <TextContent token={token} dense={dense} />}
              </Box>
            )
          }
          return token
        })}
    </>
  )
}

function PostMarkdown(props: Props) {
  const { token, dense } = props
  return (
    <>
      {token.kind === TokenType.DIVIDER && <Divider sx={{ my: 4 }} />}
      {token.kind === TokenType.TITLE && (
        <Typography variant='h5' sx={{ mt: 2, ml: 2 }}>
          {token.content}
        </Typography>
      )}
      {token.kind === TokenType.PARAGRAPH && <Content token={token} dense={dense} />}
      {token.kind === TokenType.LIST && (
        <ul>
          <Content token={token} dense={dense} component='li' />
        </ul>
      )}
      {token.kind === TokenType.CODE && (
        // syntax highlight?
        <Code>
          <code>{token.content}</code>
        </Code>
      )}
      {token.kind === TokenType.BLOCKQUOTE && (
        <BlockQuote>
          {token.content.map((pToken, index) => (
            <PostMarkdown key={index} token={pToken as Token} dense={dense} />
          ))}
        </BlockQuote>
      )}
    </>
  )
}

export default PostMarkdown
