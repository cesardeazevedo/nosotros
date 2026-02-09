import { useContentContext } from '@/components/providers/ContentProvider'
import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { Link } from '@tanstack/react-router'
import React from 'react'
import { css } from 'react-strict-dom'

type Props = {
  tag: string
  children: React.ReactNode
}

export const Tag = (props: Props) => {
  const { children, tag } = props
  const { disableLink } = useContentContext()
  if (disableLink) {
    return (
      <Text sx={styles.root} size='lg'>
        {props.children}
      </Text>
    )
  }
  return (
    <Link
      to='/feed'
      search={{ t: tag.replace('#', ''), type: 'tags' }}
      {...css.props(styles.root)}>
      {children}{' '}
    </Link>
  )
}

const styles = css.create({
  root: {
    fontWeight: 600,
    color: palette.tertiary,
  },
})
