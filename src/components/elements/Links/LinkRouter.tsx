import type { Props as TextProps } from '@/components/ui/Text/Text'
import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import type { LinkProps } from '@tanstack/react-router'
import { Link, createLink } from '@tanstack/react-router'
import { css } from 'react-strict-dom'

export type Props = LinkProps &
  TextProps & {
    color?: keyof Pick<typeof palette, 'primary' | 'secondary' | 'tertiary'>
    onClick?: () => void
    underline?: boolean
  }

const CustomLink = (props: Props) => {
  const { children, sx, underline, size = 'lg', variant, color, onClick, ...linkProps } = props
  return (
    <Link {...linkProps} onClick={onClick}>
      <Text
        variant={variant}
        size={size}
        sx={[styles.root, underline && styles.root$underline, color && styles[color], sx]}>
        {children}
      </Text>
    </Link>
  )
}

const styles = css.create({
  root: {
    fontWeight: typeScale.labelWeight$md,
  },
  root$underline: {
    textDecoration: 'inherit',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  primary: { color: palette.primary },
  secondary: { color: palette.secondary },
  tertiary: { color: palette.tertiary },
})

const LinkRouter = createLink(CustomLink)

export default LinkRouter
