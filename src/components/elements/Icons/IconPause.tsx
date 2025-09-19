type Props = Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'> & {
  size?: number
}

export const IconPause = ({ size = 24, ...svgProps }: Props) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24' {...svgProps}>
      <path fill='currentColor' d='M14 19V5h4v14zm-8 0V5h4v14z' />
    </svg>
  )
}
