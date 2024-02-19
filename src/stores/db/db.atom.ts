import { createAtom, type IAtom } from 'mobx'

export class DBAtom<T> {
  private _data: T | undefined
  _atom: IAtom

  lastTimeObserved: number
  lastTimeUnobserved: number

  constructor(value: T) {
    this._data = value
    this.lastTimeObserved = 0
    this.lastTimeUnobserved = 0

    this._atom = createAtom(
      'ObservableDB',
      () => this.onObserved(),
      () => this.onUnobserved(),
    )
  }

  get data(): T | undefined {
    this._atom.reportObserved()
    return this._data
  }

  set data(value: T) {
    this._data = value
    this._atom.reportChanged()
  }

  get isBeingObserved() {
    return this._atom.isBeingObserved_
  }

  onObserved() {
    this.lastTimeObserved = Date.now()
  }

  onUnobserved() {
    this.lastTimeUnobserved = Date.now()
  }
}
