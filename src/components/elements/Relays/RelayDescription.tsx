import type { Props as TextProps } from '@/components/ui/Text/Text'
import { Text } from '@/components/ui/Text/Text'
import { css } from 'react-strict-dom'

type Props = Omit<TextProps, 'children'> & {
  description: string | undefined
}

export const RelayDescription = (props: Props) => {
  const { description, ...rest } = props
  return (
    <Text variant='body' size='sm' {...rest} sx={[styles.root, rest.sx]}>
      {description}
    </Text>
  )
}

const styles = css.create({
  root: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitLineClamp: 2,
    boxOrient: 'vertical',
    WebkitBoxOrient: 'vertical',
    display: '-webkit-box',
  },
})
