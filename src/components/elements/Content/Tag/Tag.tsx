import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import React, { useContext } from 'react'
import { css } from 'react-strict-dom'
import { ContentContext } from '../Content'
import { ContentLink } from '../Link/Link'

type Props = {
  children: React.ReactNode
}

export const Tag = (props: Props) => {
  const { disableLink } = useContext(ContentContext)
  if (disableLink) {
    return (
      <Text sx={styles.root} size='lg'>
        {props.children}
      </Text>
    )
  }
  return (
    <ContentLink href='#'>
      <Text sx={styles.root} size='lg'>
        {props.children}
      </Text>
    </ContentLink>
  )
}

const styles = css.create({
  root: {
    fontWeight: 600,
    color: palette.tertiary,
  },
})
