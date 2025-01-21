export const storage = {
  getItem(key: string) {
    const item = localStorage.getItem(key)
    try {
      return JSON.parse(item || '{}')
    } catch (error) {
      console.error('Error when parsing data from storage', error)
      return item
    }
  },
  setItem(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('error when writing to storage', error)
    }
  },

  removeItem(key: string) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('error when writing to storage', error)
    }
  },
}
