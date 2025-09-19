import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useUserState } from '@/hooks/state/useUser'
import { palette } from '@/themes/palette.stylex'
import type { ContentSchema } from 'nostr-editor'
import React, { memo, useEffect, useRef, useState } from 'react'
import { css } from 'react-strict-dom'
import { TextContent } from '../Content/Text'

type Props = {
  pubkey: string
}

type ViewState = 'fit' | 'clamped' | 'expanded'

export const UserContentAbout = memo(function UserContentAbout(props: Props) {
  const { pubkey } = props
  const ref = useRef<HTMLDivElement>(null)
  const user = useUserState(pubkey)
  const [view, setView] = useState<ViewState>('fit')
  const schema = user?.metadata?.aboutParsed as ContentSchema

  useEffect(() => {
    if (ref.current) {
      const el = ref.current
      if (el.scrollHeight > el.clientHeight) {
        setView('clamped')
      } else {
        setView('fit')
      }
    }
  }, [schema])

  return (
    <>
      <Stack sx={[styles.root, view === 'expanded' && styles.expanded]} ref={ref}>
        {schema?.content?.map((node, index) => (
          <React.Fragment key={node.type + index}>
            {node.type === 'paragraph' && <TextContent node={node} />}
            {node.type === 'nevent' && <Text size='lg'>{node.attrs.bech32}</Text>}
          </React.Fragment>
        ))}
      </Stack>
      {view === 'clamped' && (
        <Text
          variant='label'
          size='lg'
          role='button'
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setView('expanded')
          }}
          sx={styles.showMore}>
          Show more
        </Text>
      )}
    </>
  )
})

const styles = css.create({
  root: {
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': '5',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  expanded: {
    display: 'block',
    WebkitLineClamp: 'unset',
  },
  showMore: {
    color: palette.tertiary,
    cursor: 'pointer',
    textDecoration: {
      default: 'default',
      ':hover': 'underline',
    },
  },
})
