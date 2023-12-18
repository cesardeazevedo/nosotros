import { Box, BoxProps, Divider } from '@mui/material'
import TextContent, { CodeSpan } from 'components/elements/Texts/TextContent'
import React from 'react'
import { Note } from 'stores/modules/note.store'
import { Token, TokenType } from 'utils/contentParser'
import { PostMarkdownBlockQuote } from './PostMarkdown/PostMarkdownBlockQuote'
import PostMarkdownCode from './PostMarkdown/PostMarkdownCode'
import { PostMarkdownTitle } from './PostMarkdown/PostMarkdownTitle'
import PostImage from './PostMedia/PostImage'
import PostVideo from './PostMedia/PostVideo'
import PostNote from './PostNote'

type Props = {
  token: Token
  note: Note
  dense?: boolean
}

function Content(props: Props & { component?: BoxProps['component'] }) {
  const { dense, note } = props
  const content = [...props.token.content]
  return (
    <>
      {content?.map((token, index) => {
        if (typeof token !== 'string') {
          return (
            <React.Fragment key={token.kind + index}>
              {token.kind === TokenType.IMAGE && <PostImage dense={dense} content={token.content} note={note} />}
              {token.kind === TokenType.VIDEO && <PostVideo dense={dense} content={token.content} />}
              {token.kind === TokenType.NOTE && <PostNote noteId={token.content} author={token.author} />}
              {token.kind === TokenType.TEXT && <TextContent token={token} dense={dense} />}
              {token.kind === TokenType.CODESPAN && <CodeSpan>{token.content}</CodeSpan>}
              {token.kind === TokenType.CODE && (
                <PostMarkdownCode>
                  <code>{token.content}</code>
                </PostMarkdownCode>
              )}
            </React.Fragment>
          )
        }
        return token
      })}
    </>
  )
}

function PostMarkdown(props: Props) {
  const { token, dense, note } = props
  return (
    <>
      {token.kind === TokenType.DIVIDER && <Divider sx={{ my: 4 }} />}
      {token.kind === TokenType.TITLE && <PostMarkdownTitle variant='h5'>{token.content}</PostMarkdownTitle>}
      {token.kind === TokenType.PARAGRAPH && <Content note={note} token={token} dense={dense} />}
      {token.kind === TokenType.LIST && (
        <Box sx={{ pl: 4, '> li': { pr: 2, my: 0 } }} component='ul'>
          {token.content.map((t, index) => (
            <li key={t.toString() + index}>
              <Content note={note} token={t as Token} dense={dense} />
            </li>
          ))}
        </Box>
      )}
      {token.kind === TokenType.CODE && (
        // syntax highlight?
        <PostMarkdownCode sx={{ mx: 2 }}>
          <code>{token.content}</code>
        </PostMarkdownCode>
      )}
      {token.kind === TokenType.BLOCKQUOTE && (
        <PostMarkdownBlockQuote>
          {token.content.map((pToken, index) => (
            <PostMarkdown key={index} token={pToken as Token} dense={dense} note={note} />
          ))}
        </PostMarkdownBlockQuote>
      )}
    </>
  )
}

export default PostMarkdown
