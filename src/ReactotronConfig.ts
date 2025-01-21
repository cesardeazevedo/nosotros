import Reactotron, { trackGlobalErrors } from 'reactotron-react-js'
import { mst } from 'reactotron-mst'

export const reactotron = Reactotron.configure({ name: 'nosotros' })
  // @ts-ignore
  .use(mst())
  .use(trackGlobalErrors({}))
  .connect()
