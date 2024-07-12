import { test } from 'utils/fixtures'
import { DialogStore } from '../dialogs.store'

describe('DialogsStore', () => {
  test('Should assert multiple replies stack', () => {
    const store = new DialogStore()
    expect(store.replies).toStrictEqual([false])
    store.pushReply('1')
    expect(store.replies).toStrictEqual(['1', false])
    store.pushReply('2')
    expect(store.replies).toStrictEqual(['1', '2', false])
    store.pushReply('3')
    expect(store.replies).toStrictEqual(['1', '2', '3', false])
    store.closeReply()
    expect(store.replies).toStrictEqual(['1', '2', false])
    store.closeReply()
    expect(store.replies).toStrictEqual(['1', false])
    store.closeReply()
    expect(store.replies).toStrictEqual([false])
    store.closeReply()
    expect(store.replies).toStrictEqual([false])
  })
})
