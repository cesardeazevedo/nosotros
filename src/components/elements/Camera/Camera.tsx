import { useDialogControl } from '@/hooks/useDialogs'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { IconBolt, IconBoltOff, IconX } from '@tabler/icons-react'
import { memo, useState } from 'react'
import { css, html } from 'react-strict-dom'

const iconProps = {
  strokeWidth: '1.5',
  size: 26,
}

export const Camera = memo(function Camera() {
  const [flash, setFlash] = useState(false)
  const [, onClose] = useDialogControl('camera')

  return (
    <html.div style={styles.root}>
      <Stack horizontal={true} justify='space-between' align='center' sx={styles.header}>
        <IconButton onClick={() => onClose()} icon={<IconX {...iconProps} />} />
        <Text size='lg'>CAMERA</Text>
        <IconButton
          onClick={() => setFlash(!flash)}
          icon={flash ? <IconBolt {...iconProps} /> : <IconBoltOff {...iconProps} />}
        />
      </Stack>
    </html.div>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    backgroundColor: '#000',
    width: '100%',
    height: '100%',
    color: 'white',
  },
  header: {
    padding: 16,
  },
})
