export const IconHome = (props: { size?: number }) => {
  const { size = 26, ...rest } = props
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      height={size}
      viewBox='0 -960 960 960'
      width={size}
      fill='currentColor'
      {...rest}>
      <path d='M244-204h116v-201q0-15.5 11-26.5t26.5-11h165q15.5 0 26.5 11t11 26.5v201h116v-355L480-736 244-559v355Zm-75 0v-355q0-18 7.75-33.75T199-619l236-177q20-15 45-15t45 15l236 177q14.5 10.5 22.25 26.25T791-559v355q0 30.94-22.03 52.97Q746.94-129 716-129H562.5q-15.5 0-26.5-11t-11-26.5v-201h-90v201q0 15.5-11 26.5t-26.5 11H244q-30.94 0-52.97-22.03Q169-173.06 169-204Zm311-266Z' />
    </svg>
  )
}
