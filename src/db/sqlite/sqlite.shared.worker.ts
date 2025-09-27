export {}

declare const self: SharedWorkerGlobalScope

const clients = new Map<string, MessagePort>()

;(self as SharedWorkerGlobalScope).onconnect = (e: MessageEvent) => {
  const port = e.ports[0]

  port.addEventListener(
    'message',
    (ev) => {
      const data = ev.data as { type?: string; clientId?: string }
      const { clientId } = data
      if (data?.type !== 'register' || !clientId || clients.has(clientId)) {
        return
      }

      clients.set(clientId, port)

      // clean up when tab closes
      navigator.locks.request(clientId, { mode: 'shared' }, () => {
        clients.get(clientId)?.close()
        clients.delete(clientId)
      })
    },
    { once: true },
  )

  port.addEventListener('message', (event) => {
    const msg = event.data as { clientId?: string }
    if (!msg?.clientId) return
    const target = clients.get(msg.clientId)
    if (!target) return
    target.postMessage(msg, event.ports as Transferable[])
  })

  port.start()
}
