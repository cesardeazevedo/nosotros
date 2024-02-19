import { expect } from '@playwright/test'
import type { MessageReceived } from 'stores/core/relay'
import { WebSocketServer, type WebSocket } from 'ws'

type ExpectedMessage = {
  message: unknown | unknown[]
  resolve: (reqId: string) => void
  timeoutTimeout: NodeJS.Timeout
}

export class WebSocketServerCustom extends WebSocketServer {
  messages: MessageReceived[] = []
  private _connection?: WebSocket
  private _connectionResolver?: (socket: WebSocket) => void
  private _expectedMessage: Array<ExpectedMessage> = []

  get url() {
    return `ws://localhost:${this.options.port}`
  }

  public initialize() {
    this.on('connection', (socket: WebSocket) => {
      this._connection = socket
      this._connectionResolver?.(socket)
      this._connection.on('message', (msg: string) => {
        const message = JSON.parse(msg.toString())
        this.messages.push(message)
        if (this._expectedMessage.length >= this.messages.length) {
          const expected = this._expectedMessage[this._expectedMessage.length - 1]
          this._assert(message, expected.message)
          expected.resolve(message[1])
          clearTimeout(expected.timeoutTimeout)
        }
      })
    })
  }

  private _assert(message: unknown[], expected?: unknown) {
    expect(message[0]).toStrictEqual('REQ')
    expect(message[1]).toStrictEqual(expect.any(String))
    expect(message.slice(2)).toStrictEqual(expected)
  }

  public async send(reqId: string, data: unknown) {
    return new Promise<void>((resolve, reject) => {
      if (!this._connection) {
        const error = new Error('No connection available')
        reject()
        throw error
      }
      this._connection.send(JSON.stringify(['EVENT', reqId, data]), (err) => {
        if (err) {
          throw err
        }
        resolve()
      })
    })
  }

  public async waitForConnection() {
    if (this._connection) {
      return
    }
    return new Promise<WebSocket>((resolver) => {
      this._connectionResolver = (socket) => resolver(socket)
    })
  }

  public async expectMessage(message: unknown[], timeout = 5000) {
    return new Promise<string>((resolve, reject) => {
      const stringify = JSON.stringify(message)
      const port = this.options.port?.toString().slice(0, 3)
      const timeoutTimeout = setTimeout(() => {
        const errorMsg = `Expected the relay${port} to receive a message ${stringify}\nbut it didn't receive anything in ${timeout}ms.`
        // Manual print because throwing error isn't being displayed in the playwright UI
        console.error(errorMsg)
        reject(errorMsg)
        throw new Error(errorMsg)
      }, timeout)

      this._expectedMessage?.push({ message, resolve, timeoutTimeout })

      const index = this._expectedMessage.length - 1
      const receivedMessage = this.messages[index]
      if (receivedMessage) {
        this._assert(receivedMessage, message)
        resolve(receivedMessage[1])
        clearTimeout(timeoutTimeout)
      }
    })
  }
}
