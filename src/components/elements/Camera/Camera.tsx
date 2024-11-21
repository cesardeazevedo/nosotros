import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { IconBolt, IconBoltOff, IconX } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { css, html } from 'react-strict-dom'
import { dialogStore } from 'stores/ui/dialogs.store'

const iconProps = {
  strokeWidth: '1.5',
  size: 26,
}

export const Camera = observer(function CameraDialog() {
  const [flash, setFlash] = useState(false)

  return (
    <html.div style={styles.root}>
      <Stack horizontal={true} justify='space-between' align='center' sx={styles.header}>
        <IconButton onClick={dialogStore.closeCamera} icon={<IconX {...iconProps} />} />
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
