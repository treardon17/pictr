const { job, start, stop } = require('microjob')

class ThreadManager {
  constructor() {
    this.poolStarted = false
  }

  async startWorkerPool() {
    return new Promise(async (resolve, reject) => {
      try {
        this.poolStarted = true
        await start()
        resolve()
      } catch (err) {
        this.poolStarted = false
        reject(err)
      }
    })
  }

  async stopWorkerPool() {
    return new Promise(async (resolve, reject) => {
      try {
        this.poolStarted = false
        await stop()
        resolve()
      } catch (err) {
        this.poolStarted = false
        reject(err)
      }
    })
  }

  async run(func, params = {}, options = { stopPool: true }) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.poolStarted) await this.startWorkerPool()
        const res = await job(func, { data: params })
        resolve(res)
      } catch (err) {
        reject(err)
      } finally {
        if (!options || (options && options.stopPool)) await this.stopWorkerPool()
      }
    })
  }
}

module.exports = new ThreadManager()
