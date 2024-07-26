import { appState } from 'stores/app.state'
import { assign, fromPromise, setup } from 'xstate'

const clipboard = fromPromise(async () => {
  const permissionStatus = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName })
  if (permissionStatus.state === 'granted') {
    const text = await window.navigator.clipboard.readText()
    return { text }
  }
  return Promise.reject('Permission not granted')
})

type Context = {
  pubkey?: string
  clipboardError?: string
  camera: boolean
}

export const onboardMachine = setup({
  types: {
    context: {} as Context,
    meta: {} as { index: number },
    events: {} as { type: 'back' } | { type: 'next' } | { type: 'next.pubkey' } | { type: 'paste' },
  },
  actors: {
    clipboard,
  },
  actions: {
    subscribeUser({ context }) {
      const { pubkey } = context
      if (pubkey) {
        appState.client.users.subscribe([pubkey]).subscribe()
      }
    },
  },
}).createMachine({
  initial: 'intro',
  context: {
    pubkey: undefined,
    clipboardError: undefined,
    camera: false,
  },
  states: {
    intro: {
      meta: {
        index: 0,
      },
      on: {
        next: {
          target: 'withPubkey',
        },
        back: {},
      },
    },
    withPubkey: {
      meta: {
        index: 1,
      },
      initial: 'idle',
      states: {
        idle: {
          on: {
            paste: {
              target: 'clipboard',
            },
          },
        },
        clipboard: {
          invoke: {
            src: 'clipboard',
            onError: {
              target: 'clipboardRejected',
            },
            onDone: {
              actions: assign((args) => ({ pubkey: args.event.output?.text })),
              target: 'clipboardAccepted',
            },
          },
        },
        clipboardAccepted: {},
        clipboardRejected: {
          entry: [assign(() => ({ clipboardError: 'Clipboard permission not granted' }))],
        },
      },
      on: {
        next: {
          target: 'confirm',
        },
        back: {
          target: 'intro',
        },
      },
    },
    withRemoteSigner: {
      meta: {
        index: 1,
      },
    },
    confirm: {
      meta: {
        index: 2,
      },
    },
  },
})
