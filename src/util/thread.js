const { job, start, stop } = require('microjob')

class ThreadManager {
  static async run(func, params = {}, options = {}) {
    console.log('running thread', func, params, options)
    return new Promise(async (resolve, reject) => {
      try {
        await start()
        console.log('in pool')
        const res = await job(func, { data: params })
        console.log('after job', res)
        resolve(res)
      } catch (err) {
        console.log('err in thread', err)
        reject(err)
      } finally {
        console.log('in finally')
        await stop()
      }
    })
  }
}

module.exports = ThreadManager
