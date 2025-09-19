type Props = Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'> & {
  size?: number
}

export const IconPlay = ({ size = 24, ...svgProps }: Props) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24' {...svgProps}>
      <path fill='currentColor' d='M8 19V5l11 7z' />
    </svg>
  )
}
