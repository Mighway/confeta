import { Etcd3 } from 'etcd3'
import ConfetaText from 'confeta-text'
import deasync from 'deasync'

class ConfetaEtcd extends ConfetaText {
  constructor (hosts, path, etcdOptions = {}, confetaOptions = {}) {
    try {
      const etcd = new Etcd3(Object.assign({}, { hosts }, etcdOptions))

      // Etcd3.get returns promise but deasync expects cb.
      const callbackifyEtcdGet = (args, cb) => {
        etcd.get(args)
          .then(x => cb(null, x))
          .catch(e => cb(e))
      }

      const callbackifiedGet = deasync(callbackifyEtcdGet)
      const result = callbackifiedGet(path)

      let parseFn = confetaOptions.parseFn
      let value = ''

      if (!result) {
        parseFn = () => ({}) // return empty object
      } else {
        value = result
      }

      super(value, { parseFn })
    } catch (error) {
      throw new Error(`Unhandled error while accessing ETCD: ${error}.`)
    }
  }
}

export default function createInstance (...args) {
  return new ConfetaEtcd(...args)
}
