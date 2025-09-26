import type { SqliteMessageResponse, SqliteMessages } from './sqlite.types'

type SharedMessagePayload = {
  nonce: string
  result: unknown[] | null
  payload: SqliteMessages
  error?: string
}

type Resolvers = {
  resolve: CallableFunction
  reject: CallableFunction
}

type WorkerProvider = { worker: Worker; isProvider: true } | { isProvider: false }

// This service handles multiple browser tabs by using locking a tab as a service provider
// which holds the connection to sqlite, other tabs become clients that communicate with
// the provider tab through a SharedWorker.
//
// This code is mostly based on approach from Roy Hashimoto, heavily modified.
// https://github.com/rhashimoto/wa-sqlite/discussions/81
// https://github.com/rhashimoto/wa-sqlite/blob/8be5af2954924a357c09ddaba4f9749629cb5e8c/demo/SharedService/SharedService.js
export class SqliteSharedService {
  private static CHANNEL_NAME = 'SQLITE_CHANNEL'
  private static SERVICE_NAME = 'SQLITE_SERVICE'

  private sharedWorker = window.SharedWorker
    ? new SharedWorker(new URL('./sqlite.shared.worker.ts', import.meta.url), { type: 'module' })
    : null
  private clientId = this.getClientId()
  private providerPort = this.providerChange()
  private clientChannel = new BroadcastChannel(SqliteSharedService.CHANNEL_NAME)
  private onDeactivate = new AbortController()
  private requests = new Map<string, Resolvers>()

  private workerService = Promise.withResolvers<WorkerProvider>()

  constructor(private serviceName = SqliteSharedService.SERVICE_NAME) {
    this.init()
  }

  private async init() {
    // Connect to the current provider and future providers.
    this.clientChannel.addEventListener('message', ({ data }) => {
      if (data?.type === 'provider' && data?.sharedService === this.serviceName) {
        this.providerPort = this.providerChange()
      }
    })

    // Check if we can become provider immediately
    await navigator.locks.request(this.serviceName, { ifAvailable: true }, async (locked) => {
      if (locked) {
        return await this.initializeProvider()
      } else {
        this.workerService.resolve({ isProvider: false })
      }
    })

    // Always wait for the lock (this will fire when provider dies)
    navigator.locks
      .request(this.serviceName, async () => {
        // Reset the promise since we're now becoming provider
        this.workerService = Promise.withResolvers<WorkerProvider>()
        return await this.initializeProvider()
      })
      .catch(() => {})
  }

  private async initializeProvider() {
    // provider tab
    const worker = new Worker(new URL('./sqlite.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e) => {
      const raw = e.data
      const res = (typeof raw === 'string' ? JSON.parse(raw) : raw) as SqliteMessageResponse<unknown> & {
        id: string
      }
      const resolvers = this.requests.get(res.id)
      if (!resolvers) {
        return
      }
      this.requests.delete(res.id)
      if ('error' in res) {
        resolvers.reject(res.error)
      } else {
        resolvers.resolve(res.result)
      }
    }

    this.workerService.resolve({ worker, isProvider: true })

    const service = this.createSharedServicePort()
    service.start()

    const broadcastChannel = new BroadcastChannel(SqliteSharedService.CHANNEL_NAME)
    broadcastChannel.addEventListener(
      'message',
      async ({ data }) => {
        if (data?.type !== 'request') return
        if (data?.sharedService !== this.serviceName) return

        // Get a port to send to the client.
        const requestedPort = await new Promise<MessagePort>((resolve) => {
          service.addEventListener('message', (event) => resolve(event.ports[0]), { once: true })
          service.postMessage(data.clientId)
        })

        if (this.sharedWorker) {
          this.sharedWorker.port.postMessage(data, [requestedPort])
        }
      },
      { signal: this.onDeactivate.signal },
    )

    // Tell everyone that we are the new provider.
    const providerId = await this.getClientId()
    broadcastChannel.postMessage({
      type: 'provider',
      sharedService: this.serviceName,
      providerId,
    })

    return new Promise((_, reject) => {
      this.onDeactivate.signal.addEventListener('abort', () => {
        broadcastChannel.close()
        reject(this.onDeactivate.signal.reason)
      })
    })
  }

  private close() {
    this.onDeactivate.abort()
  }

  private getRandomID() {
    return Math.random().toString(36).slice(2)
  }

  private async getClientId() {
    // Use a Web Lock to determine our clientId.
    const nonce = this.getRandomID()
    const clientId = await navigator.locks.request(nonce, async () => {
      const { held } = await navigator.locks.query()
      return held?.find((lock) => lock.name === nonce)?.clientId
    })

    // Acquire a Web Lock named after the clientId. This lets other contexts track this context's lifetime.
    await new Promise<void>((resolve) => {
      navigator.locks.request(clientId!, () => new Promise(() => resolve()))
    })

    if (this.sharedWorker) {
      this.sharedWorker.port.start()
      this.sharedWorker.port.postMessage({ type: 'register', clientId })
    }

    return clientId
  }

  private async providerChange() {
    const clientId = await this.clientId
    const nonce = this.getRandomID()
    this.clientChannel.postMessage({
      type: 'request',
      sharedService: this.serviceName,
      clientId,
      nonce,
    })
    const res = await new Promise<MessagePort | null>((resolve) => {
      const onMessage = (e: MessageEvent) => {
        const d = e.data as { nonce?: string }
        if (d?.nonce !== nonce) {
          return
        }
        // the port arrives on the shared worker message
        const port = (e.ports && e.ports[0]) || null
        if (this.sharedWorker) {
          this.sharedWorker.port.removeEventListener('message', onMessage as EventListener)
        }
        resolve(port)
      }
      if (this.sharedWorker) {
        this.sharedWorker.port.addEventListener('message', onMessage as EventListener)
      }

      setTimeout(() => {
        if (this.sharedWorker) {
          this.sharedWorker.port.removeEventListener('message', onMessage as EventListener)
        }
        resolve(null)
      }, 1500)
    })
    if (res) {
      res.onmessage = (e: MessageEvent) => {
        const raw = e.data
        const id = raw.payload.id as string
        const resolvers = this.requests.get(id)
        if (!resolvers) return
        this.requests.delete(id)
        if ('error' in res) {
          resolvers.reject(res.error)
        } else {
          resolvers.resolve(raw.result)
        }
      }
      res.start()
      return res
    }
  }

  async send<T = void>(msg: SqliteMessages) {
    const id = this.getRandomID()
    const data = JSON.stringify({ ...msg, id, sent: Date.now() })
    const service = await this.workerService.promise

    if (service.isProvider) {
      const { resolve, reject, promise } = Promise.withResolvers<T>()
      this.requests.set(id, { resolve, reject })
      service.worker.postMessage(data)
      return promise
    } else {
      const port = await this.providerPort
      if (port) {
        const { resolve, reject, promise } = Promise.withResolvers<T>()
        this.requests.set(id, { resolve, reject })
        port.postMessage(data)
        return promise
      }
      throw new Error('No provider port')
    }
  }

  private createSharedServicePort() {
    const { port1: providerPort1, port2: providerPort2 } = new MessageChannel()
    providerPort1.addEventListener('message', async ({ data: clientId }) => {
      const { port1, port2 } = new MessageChannel()

      // The port requester holds a lock while using the channel.
      // When the lock is released by the requester, clean up the port on this side.
      navigator.locks.request(clientId, () => port1.close())

      port1.addEventListener('message', async ({ data }) => {
        const response = { nonce: data.nonce, result: null } as SharedMessagePayload
        try {
          const payload = JSON.parse(data || '{}')
          response.payload = payload
          response.result = await this.send(payload)
        } catch (e) {
          const error = e as Error
          response.error = error.message
        }
        port1.postMessage(response)
      })
      port1.start()
      providerPort1.postMessage(null, [port2])
    })
    providerPort1.start()
    return providerPort2
  }
}
