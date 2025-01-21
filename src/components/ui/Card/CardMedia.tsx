import { css, html } from 'react-strict-dom'
import type { StrictReactDOMImageProps } from 'react-strict-dom/dist/types/StrictReactDOMImageProps'
import type { SxProps } from '../types'
import { cardTokens } from './Card.stylex'

type Props = StrictReactDOMImageProps & {
  sx?: SxProps
}

export const CardMedia = (props: Props) => {
  return <html.img style={[styles.root, props.sx]} {...props} />
}

const styles = css.create({
  root: {
    borderRadius: cardTokens.containerShape,
  },
})
