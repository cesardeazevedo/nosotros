import type { Props as StackProps } from '../Stack/Stack'
import { Stack } from '../Stack/Stack'

export const CardContent = (props: StackProps) => {
  return (
    <Stack gap={1} {...props} sx={props.sx}>
      {props.children}
    </Stack>
  )
}
