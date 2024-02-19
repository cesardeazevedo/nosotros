import { openDB } from 'idb'
import { Subject, type Subscription } from 'rxjs'
import { bufferTime } from 'stores/core/operators'

type Batcher = {
  [name: string]: Record<string, unknown>[]
}

export class DBWriterBatcher {
  _subject = new Subject<[string, Record<string, unknown>]>()
  subscription: Subscription

  constructor(bufferTimeSpan = 4000) {
    this.subscription = this._subject.pipe(bufferTime(bufferTimeSpan)).subscribe((data) => {
      const batches = data.reduce<Batcher>((acc, [name, value]) => {
        acc[name] ??= []
        acc[name].push(value)
        return acc
      }, {})
      for (const [name, values] of Object.entries(batches)) {
        this._put(name, values)
      }
    })
  }

  private async _put(name: string, values: Record<string, unknown>[]) {
    try {
      const db = await openDB(import.meta.env.VITE_DB_NAME)
      const tx = db.transaction(name, 'readwrite')
      const store = tx.objectStore(name)
      const inserted_at = Date.now()
      for (const value of values) {
        await store.put({ ...value, inserted_at })
      }
      await tx.done
    } catch (error) {
      console.error(error)
    }
  }

  write(name: string, value: Record<string, unknown>) {
    this._subject.next([name, value])
  }
}
